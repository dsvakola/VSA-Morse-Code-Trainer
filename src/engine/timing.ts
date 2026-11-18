/**
 * VSA Morse Code Trainer — Timing & Farnsworth Spacing Math
 *
 * Implements standard ITU-R M.1677 timing and ARRL/standard Farnsworth equations.
 *
 * The 1-3-7 Rule:
 * - Dot (dit): 1 unit
 * - Dash (dah): 3 units
 * - Intra-character element gap: 1 unit
 * - Inter-character gap: 3 units (standard) or Farnsworth stretched
 * - Inter-word gap: 7 units (standard) or Farnsworth stretched
 *
 * The Standard Word "PARIS":
 * - P: .--.  (1 + 1 + 3 + 1 + 3 + 1 + 1) = 11 units, + 3 units inter-char gap = 14
 * - A: .-    (1 + 1 + 3) = 5 units, + 3 units inter-char gap = 8
 * - R: .-.   (1 + 1 + 3 + 1 + 1) = 7 units, + 3 units inter-char gap = 10
 * - I: ..    (1 + 1 + 1) = 3 units, + 3 units inter-char gap = 6
 * - S: ...   (1 + 1 + 1 + 1 + 1) = 5 units, + 7 units inter-word gap = 12
 * - Total PARIS = 14 + 8 + 10 + 6 + 12 = exactly 50 units.
 *
 * Unit duration in ms:
 *   unitMs = 1200 / WPM
 */

import { TimingConfig, TimingUnits } from "./types";

/**
 * Standard word PARIS total unit duration: exactly 50 units.
 */
export const PARIS_STANDARD_UNITS = 50;

/**
 * Calculates the unit duration (dot length) in milliseconds for a given WPM.
 * Formula: unitMs = 1200 / WPM
 */
export function getUnitDurationMs(wpm: number): number {
  if (wpm <= 0) {
    throw new Error("WPM must be greater than 0");
  }
  return 1200 / wpm;
}

/**
 * Calculates the Farnsworth extra delay per unit (t_a) in seconds.
 *
 * When effective speed s < character speed c:
 *   t_a = (60 * c - 37.2 * s) / (19 * c * s)  [seconds]
 *
 * When s >= c:
 *   t_a = 1 unit duration at speed c = (1.2 / c) [seconds]
 *
 * References:
 * - ARRL Farnsworth calculation standards
 * - ITU-R M.1677 Recommendation
 *
 * @param c Character speed in WPM
 * @param s Effective overall speed in WPM
 * @returns t_a delay in seconds
 */
export function calculateFarnsworthDelaySeconds(c: number, s: number): number {
  if (c <= 0 || s <= 0) {
    throw new Error("Speeds must be greater than 0");
  }

  // If effective speed equals or exceeds character speed, standard unit timing applies
  if (s >= c) {
    return 1.2 / c;
  }

  // Farnsworth equation
  const numerator = 60 * c - 37.2 * s;
  const denominator = 19 * c * s;
  return numerator / denominator;
}

/**
 * Computes all exact timing units (in milliseconds) for a given TimingConfig.
 *
 * @param config Timing configuration with character speed and effective speed
 * @returns TimingUnits containing dit, dah, intra-char, inter-char, and inter-word durations in ms
 */
export function calculateTiming(config: TimingConfig): TimingUnits {
  const c = Math.max(1, config.charSpeedWpm);
  const s = Math.max(1, Math.min(config.effectiveSpeedWpm, c));

  // Element unit duration is determined solely by the character speed (c)
  const unitMs = getUnitDurationMs(c);
  const ditMs = unitMs;
  const dahMs = 3 * unitMs;
  const intraCharGapMs = unitMs;

  const taSeconds = calculateFarnsworthDelaySeconds(c, s);

  // When Farnsworth spacing is active (s < c), inter-char and inter-word gaps are stretched
  const interCharGapMs = 3 * taSeconds * 1000;
  const interWordGapMs = 7 * taSeconds * 1000;

  return {
    unitMs,
    ditMs,
    dahMs,
    intraCharGapMs,
    interCharGapMs,
    interWordGapMs,
    taSeconds,
  };
}
