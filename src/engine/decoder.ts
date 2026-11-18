/**
 * VSA Morse Code Trainer — Morse to Text Decoder
 *
 * Implements ITU-R M.1677 Morse -> Text decoding.
 * - Tolerates extra whitespace
 * - Treats '/' or 2+ consecutive spaces as word gaps
 * - Accepts alternative glyphs (. · • and - – — −)
 * - Decodes prosigns (<AR>, <SK>, <SOS>, etc.)
 * - Reports unknown Morse patterns with token index
 */

import { MORSE_TO_TEXT_MAP, normalizeMorseGlyphs } from "./morse-table";
import { DecodeResult, UnknownMorsePattern } from "./types";

/**
 * Decodes a Morse code string into plain uppercase text.
 *
 * Parsing logic:
 * - Normalizes unicode dots and dashes
 * - Splits words on '/' or multiple spaces (2 or more)
 * - Splits letters on single space
 *
 * @param input Morse string to decode
 * @returns DecodeResult containing decoded text and unknown Morse patterns
 */
export function decodeMorseToText(input: string): DecodeResult {
  if (!input || input.trim() === "") {
    return { text: "", unknownPatterns: [] };
  }

  const normalized = normalizeMorseGlyphs(input.trim());
  const unknownPatterns: UnknownMorsePattern[] = [];

  // Split into words by '/' or by two or more whitespace characters
  // e.g. "... --- ... / .-" or "... --- ...   .-"
  const rawWordTokens = normalized.split(/\s*\/\s*|\s{2,}/);
  const decodedWords: string[] = [];

  let tokenPosition = 0;

  for (const rawWord of rawWordTokens) {
    if (rawWord.trim() === "") {
      continue;
    }

    // Split word into individual character patterns by single space
    const letterPatterns = rawWord.trim().split(/\s+/);
    let decodedWord = "";

    for (const pattern of letterPatterns) {
      if (pattern === "") {
        continue;
      }

      const decodedChar = MORSE_TO_TEXT_MAP.get(pattern);
      if (decodedChar) {
        decodedWord += decodedChar;
      } else {
        unknownPatterns.push({ pattern, position: tokenPosition });
        decodedWord += "?";
      }
      tokenPosition++;
    }

    if (decodedWord.length > 0) {
      decodedWords.push(decodedWord);
    }
  }

  return {
    text: decodedWords.join(" "),
    unknownPatterns,
  };
}
