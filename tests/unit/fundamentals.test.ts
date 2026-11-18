import { describe, it, expect } from "vitest";
import { FUNDAMENTAL_CHAPTERS } from "../../src/content/fundamentals/chapters";
import { calculateTiming } from "../../src/engine/timing";
import { scheduleMorseEvents } from "../../src/engine/scheduler";

describe("Fundamentals Course Curriculum", () => {
  it("contains exactly 10 comprehensive chapters in sequential order", () => {
    expect(FUNDAMENTAL_CHAPTERS).toHaveLength(10);
    FUNDAMENTAL_CHAPTERS.forEach((ch, idx) => {
      expect(ch.number).toBe(idx + 1);
      expect(ch.id).toBeTruthy();
      expect(ch.title).toBeTruthy();
      expect(ch.subtitle).toBeTruthy();
      expect(ch.readingTimeMinutes).toBeGreaterThanOrEqual(4);
    });
  });

  it("ensures each chapter contains well-structured sections and paragraphs", () => {
    FUNDAMENTAL_CHAPTERS.forEach((ch) => {
      expect(ch.sections.length).toBeGreaterThanOrEqual(2);
      ch.sections.forEach((sec) => {
        expect(sec.title).toBeTruthy();
        expect(sec.paragraphs.length).toBeGreaterThan(0);
        sec.paragraphs.forEach((p) => {
          expect(p.trim().length).toBeGreaterThan(20);
        });
      });
    });
  });

  it("validates key takeaways and review questions for every chapter", () => {
    FUNDAMENTAL_CHAPTERS.forEach((ch) => {
      expect(ch.keyTakeaways.length).toBeGreaterThanOrEqual(3);
      expect(ch.reviewQuestions.length).toBeGreaterThanOrEqual(2);

      ch.reviewQuestions.forEach((q) => {
        expect(q.question.trim().length).toBeGreaterThan(10);
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
        expect(q.explanation.trim().length).toBeGreaterThan(15);
      });
    });
  });

  it("verifies interactive demos are configured on appropriate chapters", () => {
    const ch2 = FUNDAMENTAL_CHAPTERS.find((c) => c.number === 2);
    expect(ch2?.sections.some((s) => s.interactiveDemo === "timeline")).toBe(true);

    const ch3 = FUNDAMENTAL_CHAPTERS.find((c) => c.number === 3);
    expect(ch3?.sections.some((s) => s.interactiveDemo === "paris")).toBe(true);

    const ch4 = FUNDAMENTAL_CHAPTERS.find((c) => c.number === 4);
    expect(ch4?.sections.some((s) => s.interactiveDemo === "farnsworth")).toBe(true);
  });

  it("mathematically verifies the standard word 'PARIS' equals 50 units", () => {
    const wpm = 20;
    const timing = calculateTiming({ charSpeedWpm: wpm, effectiveSpeedWpm: wpm });
    // PARIS without trailing space is 43 units (31 element units + 4 * 3 inter-char gaps)
    const events = scheduleMorseEvents(".--. .- .-. .. ...", {
      charSpeedWpm: wpm,
      effectiveSpeedWpm: wpm,
    });

    const charMs = events.reduce((sum, ev) => sum + ev.durationMs, 0);
    // At 20 WPM: 1 unit = 1200 / 20 = 60 ms
    const unitMs = 1200 / wpm;
    expect(unitMs).toBe(60);

    // 43 units for characters
    expect(Math.round(charMs / unitMs)).toBe(43);

    // + 7 units for the standard inter-word gap (interWordGapMs = 7 * unitMs = 420 ms)
    const totalParisMs = charMs + timing.interWordGapMs;
    const totalUnits = Math.round(totalParisMs / unitMs);
    expect(totalUnits).toBe(50);
    expect(Math.round(totalParisMs)).toBe(3000);

    // Number of PARIS repetitions in 60 seconds (1 minute):
    const repetitionsInMinute = 60000 / totalParisMs;
    expect(Math.round(repetitionsInMinute)).toBe(20); // Exactly 20 WPM!
  });

  it("verifies individual letter unit counts of PARIS", () => {
    const unitTiming = calculateTiming({ charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const u = unitTiming.ditMs; // 60ms = 1 unit

    // P: dit(1) + intra(1) + dah(3) + intra(1) + dah(3) + intra(1) + dit(1) = 11 units
    const pEvents = scheduleMorseEvents(".--.", { charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const pDuration = pEvents.reduce((s, e) => s + e.durationMs, 0);
    expect(Math.round(pDuration / u)).toBe(11);

    // A: dit(1) + intra(1) + dah(3) = 5 units
    const aEvents = scheduleMorseEvents(".-", { charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const aDuration = aEvents.reduce((s, e) => s + e.durationMs, 0);
    expect(Math.round(aDuration / u)).toBe(5);

    // R: dit(1) + intra(1) + dah(3) + intra(1) + dit(1) = 7 units
    const rEvents = scheduleMorseEvents(".-.", { charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const rDuration = rEvents.reduce((s, e) => s + e.durationMs, 0);
    expect(Math.round(rDuration / u)).toBe(7);

    // I: dit(1) + intra(1) + dit(1) = 3 units
    const iEvents = scheduleMorseEvents("..", { charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const iDuration = iEvents.reduce((s, e) => s + e.durationMs, 0);
    expect(Math.round(iDuration / u)).toBe(3);

    // S: dit(1) + intra(1) + dit(1) + intra(1) + dit(1) = 5 units
    const sEvents = scheduleMorseEvents("...", { charSpeedWpm: 20, effectiveSpeedWpm: 20 });
    const sDuration = sEvents.reduce((s, e) => s + e.durationMs, 0);
    expect(Math.round(sDuration / u)).toBe(5);

    // Sum of letter elements = 11 + 5 + 7 + 3 + 5 = 31 units
    // 4 inter-character spaces (between P-A, A-R, R-I, I-S) = 4 * 3 = 12 units
    // 1 inter-word space after S = 7 units
    // Total: 31 + 12 + 7 = 50 units!
    expect(11 + 5 + 7 + 3 + 5 + 12 + 7).toBe(50);
  });
});
