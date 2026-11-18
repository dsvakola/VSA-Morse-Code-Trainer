/**
 * VSA Morse Code Trainer — settings store. Saved by Rust in the app data folder.
 */

import { loadDoc, saveDoc } from "../api";

export type KeyMode = "straight" | "iambic-a" | "iambic-b";

export interface Settings {
  charSpeedWpm: number;
  effectiveSpeedWpm: number;
  pitchHz: number;
  volumePct: number;
  noiseLevel: number;
  keyBinding: string; // KeyboardEvent.code for the straight key, e.g. "Space"
  keyMode: KeyMode;
  fontSize: number; // px, 14-20
  dailyGoalMinutes: number;
  unlockAccuracyPct: number;
  kochUnlockPct: number;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  charSpeedWpm: 20,
  effectiveSpeedWpm: 10,
  pitchHz: 600,
  volumePct: 80,
  noiseLevel: 0,
  keyBinding: "Space",
  keyMode: "straight",
  fontSize: 16,
  dailyGoalMinutes: 15,
  unlockAccuracyPct: 80,
  kochUnlockPct: 90,
  reducedMotion: false,
};

const clamp = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Accepts anything (an old file, an imported backup) and returns valid settings. */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof Settings, unknown>>;
  const d = DEFAULT_SETTINGS;
  const charSpeedWpm = clamp(r.charSpeedWpm, 5, 50, d.charSpeedWpm);
  return {
    charSpeedWpm,
    effectiveSpeedWpm: clamp(
      r.effectiveSpeedWpm,
      3,
      charSpeedWpm,
      Math.min(d.effectiveSpeedWpm, charSpeedWpm),
    ),
    pitchHz: clamp(r.pitchHz, 300, 1000, d.pitchHz),
    volumePct: clamp(r.volumePct, 0, 100, d.volumePct),
    noiseLevel: clamp(r.noiseLevel, 0, 100, d.noiseLevel),
    keyBinding: typeof r.keyBinding === "string" && r.keyBinding ? r.keyBinding : d.keyBinding,
    keyMode: r.keyMode === "iambic-a" || r.keyMode === "iambic-b" ? r.keyMode : "straight",
    fontSize: clamp(r.fontSize, 14, 20, d.fontSize),
    dailyGoalMinutes: clamp(r.dailyGoalMinutes, 5, 120, d.dailyGoalMinutes),
    unlockAccuracyPct: clamp(r.unlockAccuracyPct, 50, 100, d.unlockAccuracyPct),
    kochUnlockPct: clamp(r.kochUnlockPct, 50, 100, d.kochUnlockPct),
    reducedMotion: r.reducedMotion === true,
  };
}

type Listener = (s: Settings) => void;

let current: Settings = { ...DEFAULT_SETTINGS };
const listeners = new Set<Listener>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function getSettings(): Settings {
  return current;
}

export function subscribeSettings(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applyToDocument(s: Settings): void {
  document.documentElement.style.fontSize = `${s.fontSize}px`;
  document.documentElement.classList.toggle("reduced-motion", s.reducedMotion);
}

export function updateSettings(patch: Partial<Settings>): void {
  current = sanitizeSettings({ ...current, ...patch });
  applyToDocument(current);
  listeners.forEach((fn) => fn(current));
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDoc("settings", current).catch(() => {
      /* reported on next save attempt */
    });
  }, 400);
}

export function resetSettings(): void {
  updateSettings({ ...DEFAULT_SETTINGS });
}

export async function initSettings(): Promise<void> {
  try {
    current = sanitizeSettings(await loadDoc<Settings>("settings"));
  } catch {
    current = { ...DEFAULT_SETTINGS };
  }
  applyToDocument(current);
}
