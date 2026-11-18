import { describe, it, expect } from "vitest";
import { scheduleMorseEvents, getTotalDurationMs } from "../../src/engine/scheduler";

describe("Morse Event Scheduler", () => {
  const plain20Wpm = { charSpeedWpm: 20, effectiveSpeedWpm: 20 };

  it("schedules a single dit accurately", () => {
    // E = "."
    const events = scheduleMorseEvents(".", plain20Wpm);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: "on",
      durationMs: 60,
      kind: "dit",
      char: "E",
    });
    expect(getTotalDurationMs(events)).toBe(60);
  });

  it("schedules a single dah accurately", () => {
    // T = "-"
    const events = scheduleMorseEvents("-", plain20Wpm);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: "on",
      durationMs: 180,
      kind: "dah",
      char: "T",
    });
    expect(getTotalDurationMs(events)).toBe(180);
  });

  it("schedules intra-character gap between elements of 'A' (.-)", () => {
    const events = scheduleMorseEvents(".-", plain20Wpm);
    // on(dit=60), off(intra=60), on(dah=180)
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "on", durationMs: 60, kind: "dit", char: "A" });
    expect(events[1]).toEqual({ type: "off", durationMs: 60, kind: "intra-char-gap" });
    expect(events[2]).toEqual({ type: "on", durationMs: 180, kind: "dah", char: "A" });
    expect(getTotalDurationMs(events)).toBe(300); // 5 units * 60ms
  });

  it("schedules inter-character gap between letters in a word", () => {
    // "ET" (. -)
    const events = scheduleMorseEvents(". -", plain20Wpm);
    // on(60) [E], off(inter-char=180), on(180) [T]
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "on", durationMs: 60, kind: "dit", char: "E" });
    expect(events[1]).toEqual({ type: "off", durationMs: 180, kind: "inter-char-gap" });
    expect(events[2]).toEqual({ type: "on", durationMs: 180, kind: "dah", char: "T" });
    expect(getTotalDurationMs(events)).toBe(420); // 1 + 3 + 3 = 7 units * 60ms
  });

  it("schedules inter-word gap between words across slash '/'", () => {
    // "E / T" (. / -)
    const events = scheduleMorseEvents(". / -", plain20Wpm);
    // on(60) [E], off(inter-word=420), on(180) [T]
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "on", durationMs: 60, kind: "dit", char: "E" });
    expect(events[1]).toEqual({ type: "off", durationMs: 420, kind: "inter-word-gap" });
    expect(events[2]).toEqual({ type: "on", durationMs: 180, kind: "dah", char: "T" });
    expect(getTotalDurationMs(events)).toBe(660); // 1 + 7 + 3 = 11 units * 60ms
  });

  it("returns empty array on empty input", () => {
    expect(scheduleMorseEvents("", plain20Wpm)).toEqual([]);
    expect(scheduleMorseEvents("   ", plain20Wpm)).toEqual([]);
  });

  it("schedules full PARIS standard word and verifies unit math", () => {
    // P: .--.  A: .-  R: .-.  I: ..  S: ...
    const parisMorse = ".--. .- .-. .. ...";
    const events = scheduleMorseEvents(parisMorse, plain20Wpm);

    // Sum of events before trailing word gap is 43 units * 60ms = 2580ms
    const totalMs = getTotalDurationMs(events);
    expect(totalMs).toBe(2580);

    // Adding the trailing word gap (7 units * 60ms = 420ms) produces exactly 50 units (3000ms)!
    expect(totalMs + 420).toBe(3000);
  });
});
