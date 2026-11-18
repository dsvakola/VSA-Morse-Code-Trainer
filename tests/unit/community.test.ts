import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { COMMUNITY } from "../../src/pages/community";

const capability = JSON.parse(readFileSync("src-tauri/capabilities/default.json", "utf8"));
const allowed: string[] = capability.permissions
  .filter(
    (p: unknown) =>
      typeof p === "object" &&
      p !== null &&
      (p as { identifier: string }).identifier === "opener:allow-open-url",
  )
  .flatMap((p: { allow: Array<{ url: string }> }) => p.allow.map((a) => a.url));

const permitted = (url: string) =>
  allowed.some((pattern) =>
    pattern.endsWith("*") ? url.startsWith(pattern.slice(0, -1)) : url === pattern,
  );

describe("ham community links", () => {
  it("are all https and allowed by the opener permission", () => {
    for (const group of COMMUNITY) {
      for (const link of group.links) {
        expect(link.url.startsWith("https://")).toBe(true);
        expect(permitted(link.url), link.url).toBe(true);
      }
    }
  });
  it("allow the About page buttons", () => {
    expect(permitted("https://github.com/dsvakola/software")).toBe(true);
    expect(permitted("mailto:softinquiry@vsa.edu.in")).toBe(true);
  });
});
