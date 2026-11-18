import { describe, it, expect } from "vitest";
import { estimateUnitLengthMs, classifyTappingStream } from "../../src/engine/classifier";

describe("Key-Tapping Auto-Calibrating Classifier", () => {
  it("estimates unit length from press durations", () => {
    // 20 WPM: dits ~60ms, dahs ~180ms
    const presses = [
      { pressMs: 62, gapMs: 58 },
      { pressMs: 59, gapMs: 61 },
      { pressMs: 182, gapMs: 178 },
      { pressMs: 60, gapMs: 60 },
      { pressMs: 179, gapMs: 400 },
    ];

    const estimated = estimateUnitLengthMs(presses);
    expect(estimated).toBeGreaterThanOrEqual(55);
    expect(estimated).toBeLessThanOrEqual(65);
  });

  it("classifies clean simulated 'A' (.-) at 20 WPM", () => {
    // A = .-
    const presses = [
      { pressMs: 60, gapMs: 60 }, // dit + intra-char gap
      { pressMs: 180, gapMs: 200 }, // dah + trailing
    ];

    const output = classifyTappingStream(presses, 60);
    expect(output.decodedMorse).toBe(".-");
    expect(output.decodedText).toBe("A");
    expect(output.dashDotRatio).toBe(3.0);
    expect(output.estimatedWpm).toBe(20);
  });

  it("classifies simulated 'SOS' (... --- ...) with inter-char gaps", () => {
    const presses = [
      // S: ...
      { pressMs: 60, gapMs: 60 },
      { pressMs: 60, gapMs: 60 },
      { pressMs: 60, gapMs: 180 }, // inter-char gap
      // O: ---
      { pressMs: 180, gapMs: 60 },
      { pressMs: 180, gapMs: 60 },
      { pressMs: 180, gapMs: 180 }, // inter-char gap
      // S: ...
      { pressMs: 60, gapMs: 60 },
      { pressMs: 60, gapMs: 60 },
      { pressMs: 60, gapMs: 300 }, // trailing
    ];

    const output = classifyTappingStream(presses, 60);
    expect(output.decodedMorse).toBe("... --- ...");
    expect(output.decodedText).toBe("SOS");
    expect(output.dashDotRatio).toBe(3.0);
  });

  it("classifies words separated by inter-word gap (5+ units)", () => {
    // "E E" (.  .)
    const presses = [
      { pressMs: 60, gapMs: 420 }, // 7 units word gap
      { pressMs: 60, gapMs: 200 },
    ];

    const output = classifyTappingStream(presses, 60);
    expect(output.decodedMorse).toBe(". / .");
    expect(output.decodedText).toBe("E E");
  });

  it("recognises a letter made only of dahs ('O') without a calibrated unit", () => {
    const output = classifyTappingStream([
      { pressMs: 180, gapMs: 60 },
      { pressMs: 180, gapMs: 60 },
      { pressMs: 180, gapMs: 0 },
    ]);
    expect(output.decodedText).toBe("O");
  });

  it("recognises 'M T' (all dahs, with a letter gap) without a calibrated unit", () => {
    const output = classifyTappingStream([
      { pressMs: 180, gapMs: 60 },
      { pressMs: 180, gapMs: 180 },
      { pressMs: 180, gapMs: 0 },
    ]);
    expect(output.decodedText).toBe("MT");
  });

  it("still recognises all-dit letters ('S') without a calibrated unit", () => {
    const output = classifyTappingStream([
      { pressMs: 62, gapMs: 58 },
      { pressMs: 60, gapMs: 61 },
      { pressMs: 59, gapMs: 0 },
    ]);
    expect(output.decodedText).toBe("S");
  });

  it("uses the configured speed to tell 'TT' from 'II' when only letter gaps are present", () => {
    const tt = classifyTappingStream(
      [
        { pressMs: 180, gapMs: 180 },
        { pressMs: 180, gapMs: 0 },
      ],
      undefined,
      60,
    );
    expect(tt.decodedText).toBe("TT");
  });

  it("handles empty stream gracefully", () => {
    const output = classifyTappingStream([]);
    expect(output.decodedText).toBe("");
    expect(output.decodedMorse).toBe("");
    expect(output.elements).toHaveLength(0);
  });
});
