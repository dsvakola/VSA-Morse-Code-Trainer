mod commands;
mod decoder;
mod error;
mod storage;
mod wav;

use std::sync::Mutex;

use tauri::Manager;

use commands::AppState;
use storage::DocStore;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let result = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            app.manage(AppState {
                docs: Mutex::new(DocStore::new(data_dir)),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app_info,
            commands::load_doc,
            commands::save_doc,
            commands::export_wav,
            commands::export_text,
            commands::read_text_file,
            commands::decode_audio_file,
        ])
        .run(tauri::generate_context!());

    if let Err(err) = result {
        eprintln!("VSA Morse Code Trainer could not start: {err}");
        std::process::exit(1);
    }
}
