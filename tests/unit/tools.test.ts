import { describe, expect, it } from "vitest";
import { compareCopy, tokens } from "../../src/ui/copy-check";
import { binaryToText, textToBinary } from "../../src/pages/binary";
import { segmentsToPresses } from "../../src/pages/decoder";
import { rosterCsv } from "../../src/pages/teacher";
import { classifyTappingStream, encodeTextToMorse, scheduleMorseEvents } from "../../src/engine";
import { LESSONS } from "../../src/content/lessons";

describe("copy check", () => {
  it("keeps prosigns together", () => {
    expect(tokens("cq <AR> k")).toEqual(["C", "Q", "<AR>", "K"]);
  });
  it("one missed letter does not fail the rest", () => {
    const r = compareCopy("KMRSU", "KRSU");
    expect(r.correct).toBe(4);
    expect(r.results[1]).toEqual({ expected: "M", got: null, correct: false });
  });
  it("marks a wrong letter", () => {
    const r = compareCopy("ABC", "AXC");
    expect(r.correct).toBe(2);
    expect(r.results[1].got).toBe("X");
  });
});

describe("binary translator", () => {
  it("round-trips text including non-ASCII", () => {
    const text = "Hi VSA — नमस्ते";
    expect(binaryToText(textToBinary(text)).text).toBe(text);
  });
  it("uses 8 bits per byte", () => {
    expect(textToBinary("A")).toBe("01000001");
    expect(textToBinary("Hi", "")).toBe("0100100001101001");
  });
  it("reports leftover bits", () => {
    expect(binaryToText("01000001 101")).toEqual({ text: "A", leftover: 3 });
  });
});

describe("audio decoder bridge", () => {
  it("turns tone segments into presses that decode back to text", () => {
    const events = scheduleMorseEvents(encodeTextToMorse("PARIS SOS").morse, {
      charSpeedWpm: 20,
      effectiveSpeedWpm: 20,
    });
    const segments = [
      { on: false, durationMs: 300 },
      ...events.map((e) => ({ on: e.type === "on", durationMs: e.durationMs })),
    ];
    const presses = segmentsToPresses({ toneHz: 600, durationMs: 0, segments });
    expect(classifyTappingStream(presses).decodedText).toBe("PARIS SOS");
  });
});

describe("teacher's desk", () => {
  it("escapes CSV cells", () => {
    const csv = rosterCsv([
      {
        id: "1",
        name: 'John "JD" Doe',
        group: "A, B",
        quizLevel: 3,
        kochChars: 10,
        wpm: 12,
        notes: "",
        updated: "2026-11-18",
      },
    ]);
    expect(csv.split("\r\n")[1]).toBe('"John ""JD"" Doe","A, B",3,10,12,,2026-11-18');
  });
});

describe("lessons", () => {
  it("cover every Koch character and end with words and sentences", () => {
    const chars = LESSONS.flatMap((l) => l.newChars);
    expect(chars).toContain("K");
    expect(chars).toContain("0");
    expect(LESSONS[LESSONS.length - 1].items?.length).toBeGreaterThan(0);
    LESSONS.forEach((l, i) => expect(l.number).toBe(i + 1));
  });
});
