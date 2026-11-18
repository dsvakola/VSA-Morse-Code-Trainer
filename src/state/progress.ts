/**
 * VSA Morse Code Trainer — learning progress, saved by Rust in the app data folder.
 */

import { loadDoc, saveDoc } from "../api";

export interface CharStat {
  attempts: number;
  correct: number;
  recentErrors: number;
}

export interface QuizRecord {
  date: string; // ISO date-time
  level: number;
  score: number;
  total: number;
}

export interface Progress {
  fundamentalsCompleted: string[];
  lessonsCompleted: number[];
  kochUnlocked: number;
  charStats: Record<string, CharStat>;
  quizHistory: QuizRecord[];
  bestQuizLevel: number;
  sendingBest: number;
  /** Seconds practised per local date (YYYY-MM-DD). */
  practiceSeconds: Record<string, number>;
  operatorName: string;
}

export const EMPTY_PROGRESS: Progress = {
  fundamentalsCompleted: [],
  lessonsCompleted: [],
  kochUnlocked: 2,
  charStats: {},
  quizHistory: [],
  bestQuizLevel: 0,
  sendingBest: 0,
  practiceSeconds: {},
  operatorName: "",
};

let current: Progress = structuredClone(EMPTY_PROGRESS);
const listeners = new Set<(p: Progress) => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function getProgress(): Progress {
  return current;
}

export function subscribeProgress(fn: (p: Progress) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function updateProgress(mutate: (p: Progress) => void): void {
  mutate(current);
  listeners.forEach((fn) => fn(current));
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveDoc("progress", current).catch(() => {
      /* retried on the next change */
    });
  }, 500);
}

export async function initProgress(): Promise<void> {
  try {
    const saved = await loadDoc<Partial<Progress>>("progress");
    current = { ...structuredClone(EMPTY_PROGRESS), ...(saved ?? {}) };
  } catch {
    current = structuredClone(EMPTY_PROGRESS);
  }
}

export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Adds practice time to today's total (called while a practice room is active). */
export function addPracticeSeconds(seconds: number): void {
  if (seconds <= 0) return;
  updateProgress((p) => {
    const today = localDate();
    p.practiceSeconds[today] = (p.practiceSeconds[today] ?? 0) + seconds;
  });
}

/** Consecutive days with at least one minute of practice, ending today (or yesterday). */
export function streakDays(p: Progress, today = new Date()): number {
  const practised = (d: Date) => (p.practiceSeconds[localDate(d)] ?? 0) >= 60;
  const day = new Date(today);
  if (!practised(day)) day.setDate(day.getDate() - 1);
  let count = 0;
  while (practised(day)) {
    count++;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

export function minutesToday(p: Progress): number {
  return Math.floor((p.practiceSeconds[localDate()] ?? 0) / 60);
}

/** Records one answer for a character (Koch, drills, quizzes). */
export function recordAnswer(char: string, correct: boolean): void {
  updateProgress((p) => {
    const s = (p.charStats[char] ??= { attempts: 0, correct: 0, recentErrors: 0 });
    s.attempts++;
    if (correct) {
      s.correct++;
      s.recentErrors = Math.max(0, s.recentErrors - 1);
    } else {
      s.recentErrors = Math.min(5, s.recentErrors + 1);
    }
  });
}

/**
 * Starts a practice timer for a room. Counts only while the window is visible.
 * Returns a stop function that saves the time.
 */
export function startPracticeTimer(): () => void {
  let last = Date.now();
  const tick = () => {
    const now = Date.now();
    if (document.visibilityState === "visible") addPracticeSeconds(Math.round((now - last) / 1000));
    last = now;
  };
  const id = setInterval(tick, 30_000);
  return () => {
    clearInterval(id);
    tick();
  };
}
