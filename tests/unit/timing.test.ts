import { describe, it, expect } from "vitest";
import {
  PARIS_STANDARD_UNITS,
  getUnitDurationMs,
  calculateFarnsworthDelaySeconds,
  calculateTiming,
} from "../../src/engine/timing";

describe("Morse Timing Math (1-3-7 Rule, PARIS, Farnsworth)", () => {
  it("defines PARIS as exactly 50 standard units", () => {
    expect(PARIS_STANDARD_UNITS).toBe(50);
  });

  it("calculates unit duration via 1200 / WPM rule", () => {
    // 20 WPM -> 60 ms unit
    expect(getUnitDurationMs(20)).toBe(60);
    // 12 WPM -> 100 ms unit
    expect(getUnitDurationMs(12)).toBe(100);
    // 60 WPM -> 20 ms unit
    expect(getUnitDurationMs(60)).toBe(20);
    // 5 WPM -> 240 ms unit
    expect(getUnitDurationMs(5)).toBe(240);
  });

  it("throws on non-positive WPM", () => {
    expect(() => getUnitDurationMs(0)).toThrow();
    expect(() => getUnitDurationMs(-5)).toThrow();
  });

  it("calculates plain timing when effective speed equals character speed (c = s)", () => {
    const timing = calculateTiming({ charSpeedWpm: 20, effectiveSpeedWpm: 20 });

    expect(timing.unitMs).toBe(60);
    expect(timing.ditMs).toBe(60);
    expect(timing.dahMs).toBe(180); // 3 units
    expect(timing.intraCharGapMs).toBe(60); // 1 unit
    expect(timing.interCharGapMs).toBe(180); // 3 units
    expect(timing.interWordGapMs).toBe(420); // 7 units
  });

  it("calculates Farnsworth delay for known values c=18, s=5 WPM", () => {
    // Formula: t_a = (60*18 - 37.2*5) / (19*18*5) = (1080 - 186) / 1710 = 894 / 1710 ≈ 0.522807 seconds
    const ta = calculateFarnsworthDelaySeconds(18, 5);
    expect(ta).toBeCloseTo(894 / 1710, 5);

    const timing = calculateTiming({ charSpeedWpm: 18, effectiveSpeedWpm: 5 });

    // Elements remain at character speed c=18: unit = 1200 / 18 ≈ 66.67 ms
    expect(timing.unitMs).toBeCloseTo(1200 / 18, 2);
    expect(timing.ditMs).toBeCloseTo(1200 / 18, 2);
    expect(timing.dahMs).toBeCloseTo(3 * (1200 / 18), 2);
    expect(timing.intraCharGapMs).toBeCloseTo(1200 / 18, 2);

    // Stretched Farnsworth gaps:
    // interCharGap = 3 * t_a seconds
    expect(timing.interCharGapMs).toBeCloseTo(3 * (894 / 1710) * 1000, 1);
    // interWordGap = 7 * t_a seconds
    expect(timing.interWordGapMs).toBeCloseTo(7 * (894 / 1710) * 1000, 1);
  });

  it("standard beginner configuration (c=20 WPM, s=10 WPM) stretches gaps appropriately", () => {
    const timing = calculateTiming({ charSpeedWpm: 20, effectiveSpeedWpm: 10 });

    // Character tone elements stay at 20 WPM (60 ms dit, 180 ms dah)
    expect(timing.ditMs).toBe(60);
    expect(timing.dahMs).toBe(180);
    expect(timing.intraCharGapMs).toBe(60);

    // Gaps are wider than plain 20 WPM (180ms / 420ms)
    expect(timing.interCharGapMs).toBeGreaterThan(180);
    expect(timing.interWordGapMs).toBeGreaterThan(420);
  });
});
