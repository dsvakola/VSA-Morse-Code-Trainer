import { describe, it, expect } from "vitest";
import {
  MIRROR_PAIRS,
  getMirrorPartner,
  isSelfMirror,
  reverseMorsePattern,
} from "../../src/engine/mirrors";

describe("Morse Mirror Pairs & Symmetries", () => {
  it("reverses Morse patterns accurately", () => {
    expect(reverseMorsePattern(".-")).toBe("-.");
    expect(reverseMorsePattern("-...")).toBe("...-");
    expect(reverseMorsePattern(".-.")).toBe(".-.");
  });

  it("identifies direct inverted letter pairs", () => {
    expect(getMirrorPartner("A")).toBe("N");
    expect(getMirrorPartner("N")).toBe("A");

    expect(getMirrorPartner("B")).toBe("V");
    expect(getMirrorPartner("V")).toBe("B");

    expect(getMirrorPartner("D")).toBe("U");
    expect(getMirrorPartner("U")).toBe("D");

    expect(getMirrorPartner("F")).toBe("L");
    expect(getMirrorPartner("L")).toBe("F");

    expect(getMirrorPartner("G")).toBe("W");
    expect(getMirrorPartner("W")).toBe("G");

    expect(getMirrorPartner("Q")).toBe("Y");
    expect(getMirrorPartner("Y")).toBe("Q");
  });

  it("identifies self-mirrors (palindromic Morse patterns)", () => {
    const selfMirrors = ["E", "T", "I", "M", "S", "O", "H", "K", "R", "X", "P"];
    for (const char of selfMirrors) {
      expect(isSelfMirror(char)).toBe(true);
      expect(getMirrorPartner(char)).toBe(char);
    }
  });

  it("returns null for non-standard characters without mirror definitions", () => {
    expect(getMirrorPartner("@")).toBeNull();
  });

  it("verifies all pairs in the catalogue have valid reversed representations", () => {
    for (const pair of MIRROR_PAIRS) {
      if (pair.isSelfMirror) {
        expect(reverseMorsePattern(pair.morse1)).toBe(pair.morse1);
      } else {
        expect(reverseMorsePattern(pair.morse1)).toBe(pair.morse2);
        expect(reverseMorsePattern(pair.morse2)).toBe(pair.morse1);
      }
    }
  });
});
