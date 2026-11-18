import { describe, it, expect } from "vitest";
import { encodeTextToMorse } from "../../src/engine/encoder";

describe("Morse Encoder (Text -> Morse)", () => {
  it("encodes standard letters with single-space letter separation", () => {
    const result = encodeTextToMorse("CQ");
    expect(result.morse).toBe("-.-. --.-");
    expect(result.unsupportedChars).toHaveLength(0);
  });

  it("is case-insensitive", () => {
    const lower = encodeTextToMorse("hello");
    const upper = encodeTextToMorse("HELLO");
    expect(lower.morse).toBe(upper.morse);
    expect(lower.morse).toBe(".... . .-.. .-.. ---");
  });

  it("encodes word gaps using ' / ' separator", () => {
    const result = encodeTextToMorse("HELLO WORLD");
    expect(result.morse).toBe(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("handles consecutive spaces gracefully without extra slashes", () => {
    const result = encodeTextToMorse("HELLO    WORLD");
    expect(result.morse).toBe(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
  });

  it("encodes digits accurately", () => {
    const result = encodeTextToMorse("73 88");
    expect(result.morse).toBe("--... ...-- / ---.. ---..");
  });

  it("encodes punctuation symbols", () => {
    const result = encodeTextToMorse("OK?");
    expect(result.morse).toBe("--- -.- ..--..");
  });

  it("encodes embedded prosigns", () => {
    const result = encodeTextToMorse("TEST <AR>");
    expect(result.morse).toBe("- . ... - / .-.-.");
  });

  it("flags unsupported characters with their exact 0-based positions", () => {
    const result = encodeTextToMorse("A#B%C");
    expect(result.unsupportedChars).toHaveLength(2);
    expect(result.unsupportedChars[0]).toEqual({ char: "#", position: 1 });
    expect(result.unsupportedChars[1]).toEqual({ char: "%", position: 3 });
    expect(result.morse).toBe(".- -... -.-.");
  });

  it("returns empty string and empty unsupported list on empty input", () => {
    expect(encodeTextToMorse("")).toEqual({ morse: "", unsupportedChars: [] });
    expect(encodeTextToMorse("   ")).toEqual({ morse: "", unsupportedChars: [] });
  });
});
