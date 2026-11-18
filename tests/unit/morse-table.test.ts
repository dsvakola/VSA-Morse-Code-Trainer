import { describe, it, expect } from "vitest";
import {
  ITU_MORSE_DEFS,
  TEXT_TO_MORSE_MAP,
  normalizeMorseGlyphs,
  isSupportedChar,
  isValidMorsePattern,
} from "../../src/engine/morse-table";

describe("Morse Table & ITU-R M.1677 Character Definitions", () => {
  it("defines all 26 letters A through Z", () => {
    for (let c = 65; c <= 90; c++) {
      const letter = String.fromCharCode(c);
      expect(TEXT_TO_MORSE_MAP.has(letter)).toBe(true);
      expect(isSupportedChar(letter)).toBe(true);
    }
  });

  it("defines all 10 digits 0 through 9", () => {
    for (let d = 0; d <= 9; d++) {
      const digit = d.toString();
      expect(TEXT_TO_MORSE_MAP.has(digit)).toBe(true);
      expect(isSupportedChar(digit)).toBe(true);
    }
  });

  it("defines standard punctuation marks", () => {
    const punctuation = [
      ".",
      ",",
      "?",
      "!",
      "'",
      "/",
      "(",
      ")",
      "&",
      ":",
      ";",
      "=",
      "+",
      "-",
      "_",
      '"',
      "$",
      "@",
    ];
    for (const p of punctuation) {
      expect(TEXT_TO_MORSE_MAP.has(p)).toBe(true);
    }
  });

  it("defines all official prosigns", () => {
    const prosigns = ["<AR>", "<SK>", "<BT>", "<AS>", "<KN>", "<SOS>", "<HH>"];
    for (const p of prosigns) {
      expect(TEXT_TO_MORSE_MAP.has(p)).toBe(true);
      const morse = TEXT_TO_MORSE_MAP.get(p)!;
      expect(isValidMorsePattern(morse)).toBe(true);
    }
  });

  it("SOS has the exact pattern '...---...'", () => {
    expect(TEXT_TO_MORSE_MAP.get("<SOS>")).toBe("...---...");
  });

  it("normalizes alternative Unicode dot and dash glyphs", () => {
    expect(normalizeMorseGlyphs("·•․⸱")).toBe("....");
    expect(normalizeMorseGlyphs("–—−‑‒_")).toBe("------");
    expect(normalizeMorseGlyphs("•–•")).toBe(".-.");
  });

  it("populates the complete definition catalogue", () => {
    expect(ITU_MORSE_DEFS.length).toBeGreaterThanOrEqual(60);
    for (const def of ITU_MORSE_DEFS) {
      expect(def.char).toBeDefined();
      expect(def.morse).toMatch(/^[.-]+$/);
      expect(def.rhythm).toBeDefined();
    }
  });
});
