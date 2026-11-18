/**
 * VSA Morse Code Trainer — Mirror Pairs & Symmetries Helper
 *
 * Provides lookups and pairing for Morse code inversions and self-mirrors.
 * Used in guided lessons and memory-aid training.
 *
 * Examples:
 * - Direct Mirror Pairs (reversed patterns):
 *   A (.-) <-> N (-.)
 *   B (-...) <-> V (...-)
 *   D (-..) <-> U (..-)
 *   F (..-.) <-> L (.-..)
 *   G (--.) <-> W (.--)
 *   Q (--.-) <-> Y (-.--)
 *
 * - Self-Mirrors (palindromic Morse patterns):
 *   E (.), T (-)
 *   I (..), M (--)
 *   S (...), O (---)
 *   H (....), 5 (.....), 0 (-----)
 *   K (-.-), R (.-.)
 *   X (-..-), P (.--.)
 */

import { TEXT_TO_MORSE_MAP } from "./morse-table";
import { MirrorPair } from "./types";

export const MIRROR_PAIRS: MirrorPair[] = [
  // Two-character mirror pairs
  { char1: "A", morse1: ".-", char2: "N", morse2: "-.", isSelfMirror: false },
  { char1: "B", morse1: "-...", char2: "V", morse2: "...-", isSelfMirror: false },
  { char1: "D", morse1: "-..", char2: "U", morse2: "..-", isSelfMirror: false },
  { char1: "F", morse1: "..-.", char2: "L", morse2: ".-..", isSelfMirror: false },
  { char1: "G", morse1: "--.", char2: "W", morse2: ".--", isSelfMirror: false },
  { char1: "Q", morse1: "--.-", char2: "Y", morse2: "-.--", isSelfMirror: false },

  // Self-mirrors (palindromes)
  { char1: "E", morse1: ".", char2: "E", morse2: ".", isSelfMirror: true },
  { char1: "T", morse1: "-", char2: "T", morse2: "-", isSelfMirror: true },
  { char1: "I", morse1: "..", char2: "I", morse2: "..", isSelfMirror: true },
  { char1: "M", morse1: "--", char2: "M", morse2: "--", isSelfMirror: true },
  { char1: "S", morse1: "...", char2: "S", morse2: "...", isSelfMirror: true },
  { char1: "O", morse1: "---", char2: "O", morse2: "---", isSelfMirror: true },
  { char1: "H", morse1: "....", char2: "H", morse2: "....", isSelfMirror: true },
  { char1: "K", morse1: "-.-", char2: "K", morse2: "-.-", isSelfMirror: true },
  { char1: "R", morse1: ".-.", char2: "R", morse2: ".-.", isSelfMirror: true },
  { char1: "X", morse1: "-..-", char2: "X", morse2: "-..-", isSelfMirror: true },
  { char1: "P", morse1: ".--.", char2: "P", morse2: ".--.", isSelfMirror: true },
];

/** Fast lookup map: character -> MirrorPair */
const CHAR_TO_MIRROR_MAP = new Map<string, MirrorPair>();

for (const pair of MIRROR_PAIRS) {
  CHAR_TO_MIRROR_MAP.set(pair.char1, pair);
  if (!pair.isSelfMirror) {
    CHAR_TO_MIRROR_MAP.set(pair.char2, pair);
  }
}

/**
 * Finds the mirror partner for a given character.
 * Returns the mirrored character, or the character itself if it is a self-mirror,
 * or null if no standard mirror pairing exists.
 */
export function getMirrorPartner(char: string): string | null {
  const upper = char.toUpperCase();
  const pair = CHAR_TO_MIRROR_MAP.get(upper);
  if (!pair) {
    return null;
  }
  return pair.char1 === upper ? pair.char2 : pair.char1;
}

/**
 * Checks whether a character's Morse pattern is a palindrome (self-mirror).
 */
export function isSelfMirror(char: string): boolean {
  const morse = TEXT_TO_MORSE_MAP.get(char.toUpperCase());
  if (!morse) return false;
  const reversed = morse.split("").reverse().join("");
  return morse === reversed;
}

/**
 * Reverses a Morse pattern (e.g. ".-" -> "-.")
 */
export function reverseMorsePattern(pattern: string): string {
  return pattern.split("").reverse().join("");
}
