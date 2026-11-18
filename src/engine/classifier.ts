/**
 * VSA Morse Code Trainer — Auto-Calibrating Key-Tapping Classifier
 *
 * Classifies raw keyboard/keyer press durations into dits, dahs, and spacing gaps.
 * Auto-estimates student's personal unit length without requiring strict pre-configuration.
 *
 * Timing standard:
 * - Dit: 1 unit
 * - Dah: 3 units (classification threshold ≈ 2.0 units)
 * - Intra-character element gap: 1 unit
 * - Inter-character letter gap: 3 units (classification threshold ≈ 2.0 units)
 * - Inter-word space gap: 7 units (classification threshold ≈ 5.0 units)
 */

import { MORSE_TO_TEXT_MAP } from "./morse-table";
import { ClassifiedElement, TappingRawPress } from "./types";

export interface ClassificationOutput {
  /** Decoded plain text in uppercase */
  decodedText: string;
  /** Decoded Morse string with standard spacing */
  decodedMorse: string;
  /** Estimated unit length (dit duration) in milliseconds */
  unitLengthMs: number;
  /** Estimated sending speed in WPM */
  estimatedWpm: number;
  /** Measured dash-to-dot duration ratio (ideal 3.0) */
  dashDotRatio: number;
  /** Classified elements */
  elements: ClassifiedElement[];
}

/**
 * Returns the median of a non-empty numeric array.
 */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Estimates the student's base unit length (dot duration) from a set of presses.
 *
 * 1. If the press durations form two clusters (dits and dahs), the unit is the median of the
 *    shorter cluster.
 * 2. If every press is about the same length, the presses are either all dits or all dahs
 *    (e.g. "S" or "O"). The shortest gap between elements (an intra-character gap is 1 unit) tells
 *    which: a press at least twice that gap is a dah. With no usable gap, the expected unit for
 *    the configured speed decides.
 *
 * @param presses Press and following-gap durations in milliseconds
 * @param defaultUnitMs Expected unit for the configured speed (60 ms = 20 WPM)
 */
export function estimateUnitLengthMs(
  presses: TappingRawPress[],
  defaultUnitMs: number = 60,
): number {
  if (presses.length === 0) {
    return defaultUnitMs;
  }

  const clamp = (ms: number) => Math.max(20, Math.min(400, ms));
  const durations = presses.map((p) => p.pressMs).sort((a, b) => a - b);

  // 1. Look for the largest jump between consecutive sorted durations.
  let splitIndex = -1;
  let largestRatio = 1;
  for (let i = 1; i < durations.length; i++) {
    const ratio = durations[i] / Math.max(1, durations[i - 1]);
    if (ratio > largestRatio) {
      largestRatio = ratio;
      splitIndex = i;
    }
  }
  if (largestRatio >= 1.8 && splitIndex > 0) {
    return clamp(median(durations.slice(0, splitIndex)));
  }

  // 2. One cluster: decide whether these are dits or dahs.
  const typicalPress = median(durations);
  const innerGaps = presses
    .slice(0, -1)
    .map((p) => p.gapMs)
    .filter((g) => g > 0);
  const shortestGap = innerGaps.length > 0 ? Math.min(...innerGaps) : 0;

  let pressesAreDahs: boolean;
  if (shortestGap > 0 && typicalPress >= 2 * shortestGap) {
    pressesAreDahs = true;
  } else if (shortestGap > 0 && typicalPress <= 1.5 * shortestGap) {
    // Gaps as long as the presses: either dits with 1-unit gaps, or dahs separated only by
    // letter gaps. The configured speed breaks the tie.
    pressesAreDahs = typicalPress >= 2 * defaultUnitMs;
  } else {
    pressesAreDahs = typicalPress >= 2 * defaultUnitMs;
  }

  return clamp(pressesAreDahs ? typicalPress / 3 : typicalPress);
}

/**
 * Classifies raw press & gap durations into discrete Morse elements and decoded text.
 *
 * @param presses Array of press and subsequent gap durations in milliseconds
 * @param forcedUnitMs Optional pre-calibrated unit duration in ms
 * @param expectedUnitMs Unit for the configured speed, used only to resolve all-dit / all-dah input
 */
export function classifyTappingStream(
  presses: TappingRawPress[],
  forcedUnitMs?: number,
  expectedUnitMs: number = 60,
): ClassificationOutput {
  if (presses.length === 0) {
    return {
      decodedText: "",
      decodedMorse: "",
      unitLengthMs: forcedUnitMs || 60,
      estimatedWpm: Math.round(1200 / (forcedUnitMs || 60)),
      dashDotRatio: 3.0,
      elements: [],
    };
  }

  const unitMs = forcedUnitMs || estimateUnitLengthMs(presses, expectedUnitMs);
  const ditDahThreshold = 2.0 * unitMs;
  const intraInterCharThreshold = 2.0 * unitMs;
  const interWordThreshold = 5.0 * unitMs;

  const elements: ClassifiedElement[] = [];
  const ditDurations: number[] = [];
  const dahDurations: number[] = [];

  // 1. Classify each element and its following gap
  for (let i = 0; i < presses.length; i++) {
    const press = presses[i];
    const isDah = press.pressMs >= ditDahThreshold;
    const type: "dit" | "dah" = isDah ? "dah" : "dit";

    if (isDah) {
      dahDurations.push(press.pressMs);
    } else {
      ditDurations.push(press.pressMs);
    }

    const isLast = i === presses.length - 1;
    let followingGapType: ClassifiedElement["followingGapType"] = "trailing";

    if (!isLast) {
      if (press.gapMs >= interWordThreshold) {
        followingGapType = "inter-word";
      } else if (press.gapMs >= intraInterCharThreshold) {
        followingGapType = "inter-char";
      } else {
        followingGapType = "intra-char";
      }
    }

    elements.push({
      type,
      durationMs: press.pressMs,
      followingGapType,
      followingGapMs: press.gapMs,
    });
  }

  // 2. Compute dash-to-dot ratio
  const avgDit =
    ditDurations.length > 0
      ? ditDurations.reduce((a, b) => a + b, 0) / ditDurations.length
      : unitMs;
  const avgDah =
    dahDurations.length > 0
      ? dahDurations.reduce((a, b) => a + b, 0) / dahDurations.length
      : 3 * unitMs;
  const dashDotRatio = Number((avgDah / (avgDit || 1)).toFixed(2));
  const estimatedWpm = Math.round(1200 / Math.max(1, avgDit));

  // 3. Assemble Morse string and decode text
  const morseWords: string[] = [];
  let currentMorseWord: string[] = [];
  let currentCharPattern = "";

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    currentCharPattern += el.type === "dah" ? "-" : ".";

    if (el.followingGapType === "inter-char") {
      currentMorseWord.push(currentCharPattern);
      currentCharPattern = "";
    } else if (el.followingGapType === "inter-word") {
      currentMorseWord.push(currentCharPattern);
      currentCharPattern = "";
      morseWords.push(currentMorseWord.join(" "));
      currentMorseWord = [];
    } else if (el.followingGapType === "trailing") {
      currentMorseWord.push(currentCharPattern);
      morseWords.push(currentMorseWord.join(" "));
    }
  }

  const decodedMorse = morseWords.join(" / ");

  // Decode text from assembled morse words
  const textWords: string[] = [];
  for (const wordStr of morseWords) {
    const chars = wordStr.split(" ");
    let textWord = "";
    for (const c of chars) {
      if (c) {
        textWord += MORSE_TO_TEXT_MAP.get(c) || "?";
      }
    }
    if (textWord) {
      textWords.push(textWord);
    }
  }

  return {
    decodedText: textWords.join(" "),
    decodedMorse,
    unitLengthMs: Math.round(unitMs),
    estimatedWpm,
    dashDotRatio,
    elements,
  };
}
