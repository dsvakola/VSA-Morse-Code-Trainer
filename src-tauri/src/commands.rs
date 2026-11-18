//! Tauri commands: the only bridge between the screens and the computer.

use std::path::PathBuf;
use std::sync::Mutex;

use serde::Serialize;
use serde_json::Value;
use tauri::State;

use crate::decoder::{DecodedSignal, decode_signal};
use crate::error::{AppError, AppResult};
use crate::storage::{DocStore, save_export};
use crate::wav::{ToneEvent, read_wav, render_morse_wav};

pub struct AppState {
    pub docs: Mutex<DocStore>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub developers: &'static str,
    pub organisation: &'static str,
    pub website: &'static str,
    pub email: &'static str,
}

#[tauri::command]
pub fn app_info(app: tauri::AppHandle) -> AppInfo {
    let pkg = app.package_info();
    AppInfo {
        name: pkg.name.clone(),
        version: pkg.version.to_string(),
        developers: "Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar",
        organisation: "Vidyasagar Academy",
        website: "https://vsa.edu.in/software/",
        email: "softinquiry@vsa.edu.in",
    }
}

fn lock<'a>(state: &'a State<'_, AppState>) -> AppResult<std::sync::MutexGuard<'a, DocStore>> {
    state
        .docs
        .lock()
        .map_err(|_| AppError::Invalid("The data store is busy. Please try again.".into()))
}

/// Loads a saved document (settings, progress, roster...). `null` when never saved.
#[tauri::command]
pub fn load_doc(state: State<'_, AppState>, name: String) -> AppResult<Option<Value>> {
    lock(&state)?.load(&name)
}

/// Saves a document atomically in the app data folder.
#[tauri::command]
pub fn save_doc(state: State<'_, AppState>, name: String, value: Value) -> AppResult<()> {
    lock(&state)?.save(&name, &value)
}

/// Renders a Morse timeline to a WAV file at the path the user chose.
#[tauri::command]
pub async fn export_wav(
    path: PathBuf,
    events: Vec<ToneEvent>,
    pitch_hz: f64,
    volume: f64,
) -> AppResult<()> {
    tauri::async_runtime::spawn_blocking(move || {
        let bytes = render_morse_wav(&events, pitch_hz, volume)?;
        save_export(&path, &bytes)
    })
    .await
    .map_err(|e| AppError::Invalid(format!("The export stopped unexpectedly: {e}")))?
}

/// Saves text (backup JSON, CSV report, binary translation) at the path the user chose.
#[tauri::command]
pub fn export_text(path: PathBuf, contents: String) -> AppResult<()> {
    save_export(&path, contents.as_bytes())
}

/// Reads a text file the user chose (a backup or a class list), up to 20 MB.
#[tauri::command]
pub fn read_text_file(path: PathBuf) -> AppResult<String> {
    let meta = std::fs::metadata(&path).map_err(|e| AppError::io("open the file", e))?;
    if meta.len() > 20 * 1024 * 1024 {
        return Err(AppError::Invalid("The file is larger than 20 MB.".into()));
    }
    std::fs::read_to_string(&path).map_err(|e| AppError::io("read the file", e))
}

/// Reads a WAV recording and returns the tone / silence lengths of the Morse in it.
#[tauri::command]
pub async fn decode_audio_file(path: PathBuf) -> AppResult<DecodedSignal> {
    tauri::async_runtime::spawn_blocking(move || {
        let meta = std::fs::metadata(&path).map_err(|e| AppError::io("open the recording", e))?;
        if meta.len() > 200 * 1024 * 1024 {
            return Err(AppError::Audio("the file is larger than 200 MB.".into()));
        }
        let bytes = std::fs::read(&path).map_err(|e| AppError::io("open the recording", e))?;
        let audio = read_wav(&bytes)?;
        decode_signal(&audio)
    })
    .await
    .map_err(|e| AppError::Invalid(format!("Decoding stopped unexpectedly: {e}")))?
}
