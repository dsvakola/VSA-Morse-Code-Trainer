/**
 * VSA Morse Code Trainer — Text to Morse Encoder
 *
 * Implements ITU-R M.1677 Text -> Morse encoding.
 * - Case-insensitive
 * - Prosign support (<AR>, <SK>, <BT>, <AS>, <KN>, <SOS>, <HH>)
 * - Flags unsupported characters with 0-based positions (never silently drops)
 * - Standard spacing: 1 space between letters, '/' between words
 */

import { TEXT_TO_MORSE_MAP } from "./morse-table";
import { EncodeResult, UnsupportedChar } from "./types";

/**
 * Encodes plain text into International Morse Code.
 *
 * Format convention:
 * - One space between letters within a word
 * - Slash ('/') surrounded by spaces between words: "WORD1 / WORD2"
 *
 * @param input Raw text string to encode
 * @returns EncodeResult containing encoded morse string and list of unsupported characters
 */
export function encodeTextToMorse(input: string): EncodeResult {
  if (!input || input.trim() === "") {
    return { morse: "", unsupportedChars: [] };
  }

  const unsupportedChars: UnsupportedChar[] = [];
  const words: string[] = [];

  let currentWordMorse: string[] = [];
  let i = 0;

  while (i < input.length) {
    const remaining = input.slice(i);

    // 1. Check for Prosign tags like <AR> or [AR]
    const prosignMatch = remaining.match(/^<([A-Za-z0-9]+)>|^\[([A-Za-z0-9]+)\]/);
    if (prosignMatch) {
      const fullMatch = prosignMatch[0];
      const tagContent = (prosignMatch[1] || prosignMatch[2]).toUpperCase();
      const prosignKey = `<${tagContent}>`;

      const morse = TEXT_TO_MORSE_MAP.get(prosignKey);
      if (morse) {
        currentWordMorse.push(morse);
      } else {
        unsupportedChars.push({ char: fullMatch, position: i });
      }
      i += fullMatch.length;
      continue;
    }

    const char = input[i];

    // 2. Whitespace / Word Delimiters
    if (/\s/.test(char)) {
      if (currentWordMorse.length > 0) {
        words.push(currentWordMorse.join(" "));
        currentWordMorse = [];
      }
      i++;
      continue;
    }

    // 3. Standard Character Lookup
    const upperChar = char.toUpperCase();
    const morse = TEXT_TO_MORSE_MAP.get(upperChar);

    if (morse) {
      currentWordMorse.push(morse);
    } else {
      unsupportedChars.push({ char, position: i });
    }

    i++;
  }

  if (currentWordMorse.length > 0) {
    words.push(currentWordMorse.join(" "));
  }

  return {
    morse: words.join(" / "),
    unsupportedChars,
  };
}
