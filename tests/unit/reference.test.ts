import { describe, it, expect } from "vitest";
import qcodesData from "../../src/content/qcodes.json";
import abbrData from "../../src/content/abbreviations.json";
import americanData from "../../src/content/american-vs-international.json";

describe("Reference Library Content & Data Integrity", () => {
  it("contains all mandatory Q-codes specified in Section 5.2", () => {
    const requiredCodes = [
      "QTH",
      "QRM",
      "QRN",
      "QRS",
      "QRQ",
      "QRT",
      "QRZ",
      "QSL",
      "QSO",
      "QRP",
      "QSY",
      "QRV",
    ];

    const codes = qcodesData.map((q) => q.code);
    for (const req of requiredCodes) {
      expect(codes).toContain(req);
    }
  });

  it("contains all mandatory CW abbreviations specified in Section 5.2", () => {
    const requiredAbbrs = [
      "CQ",
      "DE",
      "K",
      "R",
      "73",
      "88",
      "TU",
      "GM",
      "GA",
      "GE",
      "ES",
      "OM",
      "YL",
      "FB",
      "PSE",
      "UR",
      "WX",
      "RST",
    ];

    const abbrs = abbrData.map((a) => a.abbr);
    for (const req of requiredAbbrs) {
      expect(abbrs).toContain(req);
    }
  });

  it("contains historical American vs International Morse comparisons", () => {
    expect(americanData.keyDifferences).toHaveLength(3);
    expect(americanData.comparisonTable.length).toBeGreaterThanOrEqual(10);

    const chars = americanData.comparisonTable.map((r) => r.char);
    expect(chars).toContain("C");
    expect(chars).toContain("L");
    expect(chars).toContain("O");
    expect(chars).toContain("P");
    expect(chars).toContain("0");
  });
});
