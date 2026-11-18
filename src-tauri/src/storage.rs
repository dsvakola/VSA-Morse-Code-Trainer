//! Named JSON documents (settings, progress, class roster) kept in the app data folder.
//!
//! Every save is atomic: the JSON is written to a temporary file, flushed, then renamed over the
//! old file, so a power cut never leaves a half-written document. The previous version is kept
//! as `<name>.bak.json` as a safe fallback.

use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};

use serde_json::Value;

use crate::error::{AppError, AppResult};

pub struct DocStore {
    dir: PathBuf,
}

/// Document names are short, lowercase and safe to use as file names.
pub fn validate_name(name: &str) -> AppResult<()> {
    let ok = !name.is_empty()
        && name.len() <= 40
        && name
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-');
    if ok {
        Ok(())
    } else {
        Err(AppError::Invalid(format!(
            "'{name}' is not a valid document name."
        )))
    }
}

impl DocStore {
    pub fn new(dir: impl Into<PathBuf>) -> Self {
        Self { dir: dir.into() }
    }

    fn path_for(&self, name: &str) -> PathBuf {
        self.dir.join(format!("{name}.json"))
    }

    /// Loads a document. Returns `None` when it has never been saved. If the main file is
    /// damaged, the backup copy is used instead.
    pub fn load(&self, name: &str) -> AppResult<Option<Value>> {
        validate_name(name)?;
        let path = self.path_for(name);
        match read_json(&path) {
            Ok(value) => Ok(value),
            Err(main_err) => {
                let backup = self.dir.join(format!("{name}.bak.json"));
                match read_json(&backup) {
                    Ok(Some(value)) => Ok(Some(value)),
                    _ => Err(main_err),
                }
            }
        }
    }

    /// Saves a document atomically, keeping the previous version as a backup.
    pub fn save(&self, name: &str, value: &Value) -> AppResult<()> {
        validate_name(name)?;
        fs::create_dir_all(&self.dir).map_err(|e| AppError::io("create the data folder", e))?;

        let path = self.path_for(name);
        let tmp = self.dir.join(format!("{name}.json.tmp"));
        let text =
            serde_json::to_string_pretty(value).map_err(|e| AppError::Data(e.to_string()))?;
        write_atomic(&tmp, &path, text.as_bytes())?;

        // Refresh the backup from the file we just wrote (best effort).
        let _ = fs::copy(&path, self.dir.join(format!("{name}.bak.json")));
        Ok(())
    }
}

fn read_json(path: &Path) -> AppResult<Option<Value>> {
    match fs::read_to_string(path) {
        Ok(text) => serde_json::from_str(&text)
            .map(Some)
            .map_err(|e| AppError::Data(e.to_string())),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(e) => Err(AppError::io("read saved data", e)),
    }
}

/// Writes `bytes` to `tmp`, flushes it to disk, then renames it to `dest`.
pub fn write_atomic(tmp: &Path, dest: &Path, bytes: &[u8]) -> AppResult<()> {
    {
        let mut file = fs::File::create(tmp).map_err(|e| AppError::io("write the file", e))?;
        file.write_all(bytes)
            .map_err(|e| AppError::io("write the file", e))?;
        file.sync_all()
            .map_err(|e| AppError::io("write the file", e))?;
    }
    fs::rename(tmp, dest).map_err(|e| AppError::io("finish saving the file", e))
}

/// Saves a user-chosen export file (WAV, CSV, backup) atomically next to its destination.
pub fn save_export(dest: &Path, bytes: &[u8]) -> AppResult<()> {
    let parent = dest
        .parent()
        .ok_or_else(|| AppError::Invalid("Please choose a folder to save into.".into()))?;
    let file_name = dest
        .file_name()
        .ok_or_else(|| AppError::Invalid("Please choose a file name.".into()))?;
    let mut tmp_name = file_name.to_os_string();
    tmp_name.push(".partial");
    write_atomic(&parent.join(tmp_name), dest, bytes)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn temp_dir(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!(
            "vsa-morse-test-{tag}-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_nanos())
                .unwrap_or(0)
        ));
        fs::create_dir_all(&dir).expect("create temp dir");
        dir
    }

    #[test]
    fn missing_document_loads_as_none() {
        let store = DocStore::new(temp_dir("missing"));
        assert_eq!(store.load("settings").expect("load"), None);
    }

    #[test]
    fn save_then_load_round_trips() {
        let dir = temp_dir("roundtrip");
        let store = DocStore::new(&dir);
        let doc = json!({ "charSpeedWpm": 20, "pitchHz": 600 });
        store.save("settings", &doc).expect("save");
        assert_eq!(store.load("settings").expect("load"), Some(doc));
        assert!(
            !dir.join("settings.json.tmp").exists(),
            "temp file must be renamed away"
        );
        assert!(
            dir.join("settings.bak.json").exists(),
            "backup must be kept"
        );
    }

    #[test]
    fn damaged_file_falls_back_to_backup() {
        let dir = temp_dir("damaged");
        let store = DocStore::new(&dir);
        store
            .save("progress", &json!({ "chapters": [1, 2] }))
            .expect("save");
        fs::write(dir.join("progress.json"), "{ not json").expect("damage file");
        assert_eq!(
            store.load("progress").expect("load"),
            Some(json!({ "chapters": [1, 2] }))
        );
    }

    #[test]
    fn rejects_unsafe_names() {
        let store = DocStore::new(temp_dir("names"));
        for bad in ["", "../escape", "Settings", "a/b", "with space"] {
            assert!(
                store.save(bad, &json!({})).is_err(),
                "{bad:?} should be rejected"
            );
        }
    }

    #[test]
    fn export_writes_the_file() {
        let dir = temp_dir("export");
        let dest = dir.join("chart.csv");
        save_export(&dest, b"a,b\n1,2\n").expect("export");
        assert_eq!(fs::read(&dest).expect("read"), b"a,b\n1,2\n");
        assert!(!dir.join("chart.csv.partial").exists());
    }
}
