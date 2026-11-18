/**
 * VSA Morse Code Trainer — Koch Method Trainer Logic
 *
 * Implements the classic 36-character Ludwig Koch ear training sequence:
 * K M U R E S N A P T L W I J Z F O Y V G 5 Q 9 2 H 3 8 B 4 7 C 1 D 6 X 0
 *
 * Principles:
 * - Full character speed from day one (default 20 WPM)
 * - Farnsworth spacing used for beginner comprehension (default 10 WPM effective)
 * - Round begins with 2 characters (K, M)
 * - Next character unlocked when round accuracy meets threshold (default 90%)
 * - Weighted random character generation prioritizing newest and weak characters
 */

import { KochStats } from "./types";

/**
 * Standard 36-character Ludwig Koch sequence widely used for CW ear training.
 */
export const DEFAULT_KOCH_ORDER: readonly string[] = [
  "K",
  "M",
  "U",
  "R",
  "E",
  "S",
  "N",
  "A",
  "P",
  "T",
  "L",
  "W",
  "I",
  "J",
  "Z",
  "F",
  "O",
  "Y",
  "V",
  "G",
  "5",
  "Q",
  "9",
  "2",
  "H",
  "3",
  "8",
  "B",
  "4",
  "7",
  "C",
  "1",
  "D",
  "6",
  "X",
  "0",
];

/**
 * Optional extension sequence adding punctuation and operating prosigns.
 */
export const KOCH_EXTENSION_ORDER: readonly string[] = [
  ".",
  ",",
  "?",
  "/",
  "=",
  "<AR>",
  "<SK>",
  "<BT>",
];

export interface KochSessionConfig {
  order?: readonly string[];
  unlockedCount: number;
  unlockThresholdPct?: number; // default 90%
}

/**
 * Returns the array of characters currently unlocked for the student.
 * Minimum 2 characters (K, M).
 */
export function getUnlockedKochCharacters(
  unlockedCount: number,
  order: readonly string[] = DEFAULT_KOCH_ORDER,
): string[] {
  const count = Math.max(2, Math.min(unlockedCount, order.length));
  return order.slice(0, count);
}

/**
 * Checks whether the student qualifies to unlock the next Koch character.
 *
 * @param roundAccuracyPct Accuracy percentage achieved in the round (0-100)
 * @param currentUnlockedCount Current number of unlocked characters
 * @param thresholdPct Required accuracy threshold (default 90%)
 * @param totalOrderLength Total sequence length (default 36)
 */
export function shouldUnlockNextCharacter(
  roundAccuracyPct: number,
  currentUnlockedCount: number,
  thresholdPct: number = 90,
  totalOrderLength: number = DEFAULT_KOCH_ORDER.length,
): boolean {
  if (currentUnlockedCount >= totalOrderLength) {
    return false; // All characters already unlocked
  }
  return roundAccuracyPct >= thresholdPct;
}

/**
 * Generates a weighted random character from the unlocked set.
 *
 * Weighting algorithm:
 * - Base weight: 1.0 for all unlocked characters
 * - Newest unlocked character receives a 3.0x bonus weight
 * - Characters with recent errors receive additional weight proportional to error count
 *
 * @param unlockedChars List of active unlocked characters
 * @param statsMap Optional per-character historical statistics
 */
export function drawWeightedKochCharacter(
  unlockedChars: string[],
  statsMap?: Map<string, KochStats>,
): string {
  if (unlockedChars.length === 0) {
    throw new Error("Cannot draw from empty character set");
  }
  if (unlockedChars.length === 1) {
    return unlockedChars[0];
  }

  const newestChar = unlockedChars[unlockedChars.length - 1];
  const weights: number[] = [];

  for (const char of unlockedChars) {
    let weight = 1.0;

    // Prioritize newest character so student gets immediate exposure
    if (char === newestChar) {
      weight += 2.0; // 3x total base
    }

    // Prioritize recently missed characters
    if (statsMap && statsMap.has(char)) {
      const stats = statsMap.get(char)!;
      if (stats.recentErrors > 0) {
        weight += Math.min(stats.recentErrors * 1.5, 4.0);
      } else if (stats.accuracyPct < 70) {
        weight += 2.0;
      }
    }

    weights.push(weight);
  }

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < unlockedChars.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0) {
      return unlockedChars[i];
    }
  }

  return unlockedChars[unlockedChars.length - 1];
}

/**
 * Generates a round consisting of standard 5-character random groups.
 * e.g. "KMURM ERKSN MUKRE"
 *
 * @param groupCount Number of 5-character groups (e.g. 5 groups = 25 chars)
 * @param unlockedChars Active character set
 * @param statsMap Optional statistics for weighted distribution
 */
export function generateKochRoundGroups(
  groupCount: number,
  unlockedChars: string[],
  statsMap?: Map<string, KochStats>,
  groupSize: number = 5,
): string[] {
  const groups: string[] = [];

  for (let g = 0; g < groupCount; g++) {
    let group = "";
    for (let c = 0; c < groupSize; c++) {
      group += drawWeightedKochCharacter(unlockedChars, statsMap);
    }
    groups.push(group);
  }

  return groups;
}
