/**
 * VSA Morse Code Trainer — Sample-Accurate Event Scheduler
 *
 * Converts a Morse code string + TimingConfig into an array of { on | off, durationMs } events.
 * Reused across:
 * - Web Audio API playback
 * - Optical screen flash / lamp signaling
 * - 16-bit PCM WAV file exporter
 * - Automated timing and decoder unit tests
 */

import { calculateTiming } from "./timing";
import { MORSE_TO_TEXT_MAP, normalizeMorseGlyphs } from "./morse-table";
import { MorseEvent, TimingConfig } from "./types";

/**
 * Generates an ordered timeline of { on | off } duration events for a given Morse string.
 *
 * @param morseString Morse string (e.g. "... --- ..." or ".- / -...")
 * @param config Speed and timing configuration
 * @returns Array of MorseEvent objects with millisecond durations
 */
export function scheduleMorseEvents(morseString: string, config: TimingConfig): MorseEvent[] {
  if (!morseString || morseString.trim() === "") {
    return [];
  }

  const timing = calculateTiming(config);
  const normalized = normalizeMorseGlyphs(morseString.trim());
  const events: MorseEvent[] = [];

  // Split into words by '/' or 2+ whitespace characters
  const words = normalized.split(/\s*\/\s*|\s{2,}/).filter((w) => w.trim() !== "");

  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    // Split into characters by whitespace
    const characters = word
      .trim()
      .split(/\s+/)
      .filter((c) => c !== "");

    for (let c = 0; c < characters.length; c++) {
      const charMorse = characters[c];
      const char = MORSE_TO_TEXT_MAP.get(charMorse);

      // Schedule elements within the character
      for (let e = 0; e < charMorse.length; e++) {
        const symbol = charMorse[e];

        if (symbol === ".") {
          events.push({
            type: "on",
            durationMs: timing.ditMs,
            kind: "dit",
            char,
          });
        } else if (symbol === "-") {
          events.push({
            type: "on",
            durationMs: timing.dahMs,
            kind: "dah",
            char,
          });
        }

        // Intra-character gap (1 unit) between elements of the same character
        const hasNextElementInChar = e < charMorse.length - 1;
        if (hasNextElementInChar) {
          events.push({
            type: "off",
            durationMs: timing.intraCharGapMs,
            kind: "intra-char-gap",
          });
        }
      }

      // Inter-character gap between characters in the same word
      const hasNextCharInWord = c < characters.length - 1;
      if (hasNextCharInWord) {
        events.push({
          type: "off",
          durationMs: timing.interCharGapMs,
          kind: "inter-char-gap",
        });
      }
    }

    // Inter-word gap between words
    const hasNextWord = w < words.length - 1;
    if (hasNextWord) {
      events.push({
        type: "off",
        durationMs: timing.interWordGapMs,
        kind: "inter-word-gap",
      });
    }
  }

  return events;
}

/**
 * Calculates the total transmission duration (in milliseconds) for a scheduled event list.
 */
export function getTotalDurationMs(events: MorseEvent[]): number {
  return events.reduce((total, event) => total + event.durationMs, 0);
}
