import { describe, it, expect } from "vitest";
import {
  DEFAULT_KOCH_ORDER,
  getUnlockedKochCharacters,
  shouldUnlockNextCharacter,
  drawWeightedKochCharacter,
  generateKochRoundGroups,
} from "../../src/engine/koch";

describe("Koch Method Ear Trainer Logic", () => {
  it("defines the standard 36-character CW sequence starting with K and M", () => {
    expect(DEFAULT_KOCH_ORDER).toHaveLength(36);
    expect(DEFAULT_KOCH_ORDER[0]).toBe("K");
    expect(DEFAULT_KOCH_ORDER[1]).toBe("M");
    expect(DEFAULT_KOCH_ORDER[2]).toBe("U");
    expect(DEFAULT_KOCH_ORDER[3]).toBe("R");
    expect(DEFAULT_KOCH_ORDER[4]).toBe("E");
  });

  it("unlocks minimum 2 characters at lesson 1", () => {
    const chars = getUnlockedKochCharacters(1);
    expect(chars).toEqual(["K", "M"]);
  });

  it("returns exactly the requested unlocked character count up to 36", () => {
    const chars3 = getUnlockedKochCharacters(3);
    expect(chars3).toEqual(["K", "M", "U"]);

    const chars10 = getUnlockedKochCharacters(10);
    expect(chars10).toHaveLength(10);

    const charsMax = getUnlockedKochCharacters(50);
    expect(charsMax).toHaveLength(36);
  });

  it("evaluates character unlock threshold (default 90%)", () => {
    // Below 90% -> no unlock
    expect(shouldUnlockNextCharacter(89, 2)).toBe(false);
    expect(shouldUnlockNextCharacter(75, 2)).toBe(false);

    // At or above 90% -> unlock
    expect(shouldUnlockNextCharacter(90, 2)).toBe(true);
    expect(shouldUnlockNextCharacter(95, 5)).toBe(true);
    expect(shouldUnlockNextCharacter(100, 10)).toBe(true);

    // Configurable threshold (e.g. 85%)
    expect(shouldUnlockNextCharacter(86, 2, 85)).toBe(true);
    expect(shouldUnlockNextCharacter(84, 2, 85)).toBe(false);

    // When all 36 characters are already unlocked -> false
    expect(shouldUnlockNextCharacter(98, 36)).toBe(false);
  });

  it("draws weighted random characters prioritizing newest character", () => {
    const unlocked = ["K", "M", "U"];
    const counts: Record<string, number> = { K: 0, M: 0, U: 0 };

    // Draw 1000 characters
    for (let i = 0; i < 1000; i++) {
      const char = drawWeightedKochCharacter(unlocked);
      counts[char]++;
    }

    // U (the newest character) should have received significantly higher occurrences due to 3x weight
    expect(counts["U"]).toBeGreaterThan(counts["K"]);
    expect(counts["U"]).toBeGreaterThan(counts["M"]);
  });

  it("generates standard 5-character training groups", () => {
    const unlocked = getUnlockedKochCharacters(4); // K, M, U, R
    const groups = generateKochRoundGroups(5, unlocked);

    expect(groups).toHaveLength(5);
    for (const group of groups) {
      expect(group).toHaveLength(5);
      for (const char of group) {
        expect(unlocked).toContain(char);
      }
    }
  });
});
