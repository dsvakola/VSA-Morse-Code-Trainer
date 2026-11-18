# Architecture

VSA Morse Code Trainer is a Tauri 2 desktop application: a small Rust back end and a plain
TypeScript front end that runs in Windows' built-in WebView2. Nothing is bundled from Chromium,
and the app never needs the internet.

```
+--------------------------------------------------------------+
|  Front end (src/) - strict TypeScript, plain HTML and CSS     |
|  - ui/        tiny DOM helpers, Morse glyphs, lamp, key art   |
|  - pages/     one module per room (lazy-loaded by router.ts)  |
|  - engine/    pure Morse logic: tables, encoder, decoder,     |
|               timing, scheduler, Koch, classifier, scoring    |
|  - audio/     Web Audio playback, sidetone and noise          |
|  - state/     settings and progress stores                    |
|  - api.ts     the one typed wrapper around every command     |
+------------------------------|-------------------------------+
                               | invoke (IPC)
+------------------------------v-------------------------------+
|  Back end (src-tauri/src/) - Rust                            |
|  - commands.rs  #[tauri::command] functions                  |
|  - storage.rs   JSON documents in the app data folder,       |
|                 atomic writes with a backup copy             |
|  - wav.rs       WAV export (click-free envelope), WAV reader |
|  - decoder.rs   tone search and on/off timing for recordings |
|  - error.rs     readable errors returned to the interface    |
+--------------------------------------------------------------+
```

## Principles

- **Everything heavy runs in Rust.** File access, WAV rendering and audio decoding happen in
  commands; long work runs on a blocking thread so the window never freezes.
- **Commands never panic.** Each returns `Result<T, AppError>`, and the error text is written for
  the user.
- **Data stays local.** Settings, progress and the class roster are JSON files in the app data
  folder, written atomically (temporary file, then rename) with a `.bak.json` fallback.
- **Least privilege.** The window may use the open and save dialogs, and may open only the
  links listed in `src-tauri/capabilities/default.json`, in the user's own browser. A strict
  content security policy forbids remote content.
- **One version number.** `src-tauri/tauri.conf.json` holds it; the build and the About page
  read it from there.

## Tests

- `pnpm test`: the Morse engine, copy checking, binary conversion, the audio-decoder bridge,
  lessons and community links.
- `cargo test` (in `src-tauri`): storage, WAV round-trips and the audio decoder, using real
  temporary folders and files.
