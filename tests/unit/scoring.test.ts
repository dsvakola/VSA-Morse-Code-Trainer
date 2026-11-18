import { describe, it, expect } from "vitest";
import {
  computeLevenshteinDistance,
  computeTextAccuracy,
  scoreSendingPerformance,
} from "../../src/engine/scoring";
import { ClassificationOutput } from "../../src/engine/classifier";

describe("Sending Practice Scoring & Feedback Engine", () => {
  it("calculates string edit distance accurately", () => {
    expect(computeLevenshteinDistance("RADIO", "RADIO")).toBe(0);
    expect(computeLevenshteinDistance("RADIO", "RADO")).toBe(1);
    expect(computeLevenshteinDistance("CQ", "DE")).toBe(2);
  });

  it("calculates text accuracy percentage", () => {
    expect(computeTextAccuracy("CQ", "CQ")).toBe(100);
    expect(computeTextAccuracy("HELLO", "HELLO")).toBe(100);
    expect(computeTextAccuracy("HELLO", "JELLO")).toBe(80);
    expect(computeTextAccuracy("ABCD", "")).toBe(0);
  });

  it("awards a high score and encouraging feedback for accurate sending with 3:1 ratio", () => {
    const mockClassification: ClassificationOutput = {
      decodedText: "PARIS",
      decodedMorse: ".--. .- .-. .. ...",
      unitLengthMs: 60,
      estimatedWpm: 20,
      dashDotRatio: 3.0,
      elements: [
        { type: "dit", durationMs: 60, followingGapType: "intra-char", followingGapMs: 60 },
        { type: "dah", durationMs: 180, followingGapType: "inter-char", followingGapMs: 180 },
      ],
    };

    const result = scoreSendingPerformance("PARIS", mockClassification);
    expect(result.accuracyScore).toBe(100);
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.feedbackTips.length).toBeGreaterThan(0);
    expect(result.feedbackTips[0]).toContain("cadence");
  });

  it("identifies short dashes and generates constructive advice", () => {
    const mockClassification: ClassificationOutput = {
      decodedText: "A",
      decodedMorse: ".-",
      unitLengthMs: 60,
      estimatedWpm: 20,
      dashDotRatio: 2.1, // Too short!
      elements: [
        { type: "dit", durationMs: 60, followingGapType: "intra-char", followingGapMs: 60 },
        { type: "dah", durationMs: 126, followingGapType: "trailing", followingGapMs: 200 },
      ],
    };

    const result = scoreSendingPerformance("A", mockClassification);
    expect(result.timingScore).toBeLessThan(90);
    expect(result.feedbackTips.some((tip) => tip.includes("dashes are too short"))).toBe(true);
  });

  it("identifies collapsed inter-character gaps and warns the student", () => {
    const mockClassification: ClassificationOutput = {
      decodedText: "ET",
      decodedMorse: ". -",
      unitLengthMs: 60,
      estimatedWpm: 20,
      dashDotRatio: 3.0,
      elements: [
        // Inter-character gap is only 70ms instead of 180ms (3 units)
        { type: "dit", durationMs: 60, followingGapType: "inter-char", followingGapMs: 70 },
        { type: "dah", durationMs: 180, followingGapType: "trailing", followingGapMs: 200 },
      ],
    };

    const result = scoreSendingPerformance("ET", mockClassification);
    expect(result.feedbackTips.some((tip) => tip.includes("longer pause"))).toBe(true);
  });
});
