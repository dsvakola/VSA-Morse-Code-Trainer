import { describe, it, expect } from "vitest";
import { decodeMorseToText } from "../../src/engine/decoder";
import { encodeTextToMorse } from "../../src/engine/encoder";

describe("Morse Decoder (Morse -> Text)", () => {
  it("decodes basic letters into uppercase text", () => {
    const result = decodeMorseToText("-.-. --.-");
    expect(result.text).toBe("CQ");
    expect(result.unknownPatterns).toHaveLength(0);
  });

  it("decodes word gaps separated by slash '/'", () => {
    const result = decodeMorseToText(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
    expect(result.text).toBe("HELLO WORLD");
  });

  it("decodes word gaps separated by 2 or more spaces", () => {
    const result = decodeMorseToText(".... . .-.. .-.. ---   .-- --- .-. .-.. -..");
    expect(result.text).toBe("HELLO WORLD");
  });

  it("decodes alternative Unicode dot and dash glyphs", () => {
    const result = decodeMorseToText("•– –••• –•–•");
    expect(result.text).toBe("ABC");
  });

  it("decodes prosigns correctly", () => {
    const result = decodeMorseToText("...---...");
    expect(result.text).toBe("<SOS>");

    const sk = decodeMorseToText("...-.-");
    expect(sk.text).toBe("<SK>");
  });

  it("decodes patterns shared by punctuation and prosigns as punctuation, so text round-trips", () => {
    expect(decodeMorseToText(".-.-.").text).toBe("+");
    expect(decodeMorseToText("-...-").text).toBe("=");
    expect(decodeMorseToText(".-...").text).toBe("&");
    expect(decodeMorseToText("-.--.").text).toBe("(");
  });

  it("flags unknown Morse patterns with '?' and records their positions", () => {
    const result = decodeMorseToText(".- ..--.-.-. -...");
    expect(result.text).toBe("A?B");
    expect(result.unknownPatterns).toHaveLength(1);
    expect(result.unknownPatterns[0]).toEqual({
      pattern: "..--.-.-.",
      position: 1,
    });
  });

  it("preserves round-trip fidelity for every standard alphanumeric character", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (const char of alphabet) {
      const encoded = encodeTextToMorse(char).morse;
      const decoded = decodeMorseToText(encoded).text;
      expect(decoded).toBe(char);
    }
  });

  it("preserves round-trip fidelity for sentences", () => {
    const sentence = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG";
    const encoded = encodeTextToMorse(sentence).morse;
    const decoded = decodeMorseToText(encoded).text;
    expect(decoded).toBe(sentence);
  });
});
