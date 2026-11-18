/**
 * VSA Morse Code Trainer — the one typed wrapper around every Rust command.
 *
 * When the screens run in a plain browser (development preview, tests), the calls fall back to
 * localStorage or report that the feature needs the desktop app.
 */

import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { openUrl } from "@tauri-apps/plugin-opener";

/** Mirrors `commands::AppInfo` in Rust. */
export interface AppInfo {
  name: string;
  version: string;
  developers: string;
  organisation: string;
  website: string;
  email: string;
}

/** Mirrors `wav::ToneEvent`. */
export interface ToneEvent {
  on: boolean;
  durationMs: number;
}

/** Mirrors `decoder::Segment` and `decoder::DecodedSignal`. */
export interface Segment {
  on: boolean;
  durationMs: number;
}
export interface DecodedSignal {
  toneHz: number;
  durationMs: number;
  segments: Segment[];
}

export const isDesktop = (): boolean => "__TAURI_INTERNALS__" in window;

const FALLBACK_INFO: AppInfo = {
  name: "VSA Morse Code Trainer",
  version: __APP_VERSION__,
  developers: "Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar",
  organisation: "Vidyasagar Academy",
  website: "https://vsa.edu.in/software/",
  email: "softinquiry@vsa.edu.in",
};

/** Turns whatever a command rejected with into a readable sentence. */
export function errorText(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Something went wrong. Please try again.";
}

export async function appInfo(): Promise<AppInfo> {
  if (!isDesktop()) return FALLBACK_INFO;
  return invoke<AppInfo>("app_info");
}

/** Loads a saved document by name ("settings", "progress", "roster"...). */
export async function loadDoc<T>(name: string): Promise<T | null> {
  if (!isDesktop()) {
    try {
      const raw = localStorage.getItem(`vsa-doc-${name}`);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
  return invoke<T | null>("load_doc", { name });
}

export async function saveDoc(name: string, value: unknown): Promise<void> {
  if (!isDesktop()) {
    try {
      localStorage.setItem(`vsa-doc-${name}`, JSON.stringify(value));
    } catch {
      /* preview only */
    }
    return;
  }
  await invoke("save_doc", { name, value });
}

interface FileFilter {
  name: string;
  extensions: string[];
}

/** Asks where to save; returns null if the user cancels. */
export async function chooseSavePath(
  defaultName: string,
  filter: FileFilter,
): Promise<string | null> {
  if (!isDesktop()) throw new Error("Saving files needs the desktop app.");
  return save({ defaultPath: defaultName, filters: [filter] });
}

/** Asks which file to open; returns null if the user cancels. */
export async function chooseOpenPath(filter: FileFilter): Promise<string | null> {
  if (!isDesktop()) throw new Error("Opening files needs the desktop app.");
  const picked = await open({ multiple: false, directory: false, filters: [filter] });
  return typeof picked === "string" ? picked : null;
}

export async function exportWav(
  path: string,
  events: ToneEvent[],
  pitchHz: number,
  volume: number,
): Promise<void> {
  await invoke("export_wav", { path, events, pitchHz, volume });
}

export async function exportText(path: string, contents: string): Promise<void> {
  await invoke("export_text", { path, contents });
}

/** Reads a small text file the user picked (a backup or a class list). */
export async function readTextFile(path: string): Promise<string> {
  return invoke<string>("read_text_file", { path });
}

export async function decodeAudioFile(path: string): Promise<DecodedSignal> {
  return invoke<DecodedSignal>("decode_audio_file", { path });
}

/** Opens the academy website or e-mail in the user's own browser / mail program. */
export async function openExternal(url: string): Promise<void> {
  if (!isDesktop()) {
    window.open(url, "_blank", "noopener");
    return;
  }
  await openUrl(url);
}
