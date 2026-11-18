/**
 * Reference Library — every character with its sound, plus Q-codes, abbreviations,
 * mirror pairs, the American / International comparison, and a printable chart.
 */

import abbreviations from "../content/abbreviations.json";
import american from "../content/american-vs-international.json";
import qcodes from "../content/qcodes.json";
import {
  ITU_MORSE_DEFS,
  MIRROR_PAIRS,
  scheduleMorseEvents,
  type MorseCharacterDef,
} from "../engine";
import { audioPlayer } from "../audio/playback";
import { getSettings } from "../state/settings";
import { h, replace, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { morseGlyph } from "../ui/morse";

type TabId =
  | "letter"
  | "digit"
  | "punctuation"
  | "prosign"
  | "qcodes"
  | "abbr"
  | "mirrors"
  | "history"
  | "chart";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "letter", label: "Letters A–Z" },
  { id: "digit", label: "Numbers 0–9" },
  { id: "punctuation", label: "Punctuation" },
  { id: "prosign", label: "Prosigns" },
  { id: "qcodes", label: "Q-codes" },
  { id: "abbr", label: "Abbreviations" },
  { id: "mirrors", label: "Mirror pairs" },
  { id: "history", label: "American vs International" },
  { id: "chart", label: "Printable chart" },
];

function playPattern(morse: string): void {
  const s = getSettings();
  const events = scheduleMorseEvents(morse, {
    charSpeedWpm: s.charSpeedWpm,
    effectiveSpeedWpm: s.effectiveSpeedWpm,
  });
  void audioPlayer.playEvents(events, { pitchHz: s.pitchHz, volumePct: s.volumePct });
}

const playButton = (morse: string, label: string) =>
  h(
    "button",
    {
      class: "btn ghost",
      title: `Play ${label}`,
      "aria-label": `Play ${label}`,
      onclick: (e: Event) => (e.stopPropagation(), playPattern(morse)),
    },
    icon("play", "icon sm"),
  );

function charTile(d: MorseCharacterDef): HTMLElement {
  return h(
    "button",
    { class: "char-tile", onclick: () => playPattern(d.morse), title: `Play ${d.char}` },
    h(
      "div",
      { class: "row spread" },
      h("span", { class: "glyph" }, d.char),
      icon("play", "icon sm"),
    ),
    morseGlyph(d.morse),
    h("span", { class: "small mono" }, d.rhythm),
    d.category !== "letter" && d.category !== "digit"
      ? h("span", { class: "small muted" }, d.name)
      : null,
    d.hook ? h("span", { class: "small muted" }, d.hook) : null,
  );
}

function matches(q: string, ...fields: Array<string | undefined>): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return fields.some((f) => f?.toLowerCase().includes(needle));
}

function printableChart(): HTMLElement {
  const section = (title: string, cat: MorseCharacterDef["category"]) =>
    h(
      "div",
      { class: "stack" },
      h("h3", null, title),
      h(
        "div",
        { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px 18px" } },
        ITU_MORSE_DEFS.filter((d) => d.category === cat).map((d) =>
          h(
            "div",
            { class: "row", style: { gap: "10px" } },
            h("strong", { style: { width: "3.2em", fontSize: "1.2rem" } }, d.char),
            morseGlyph(d.morse),
          ),
        ),
      ),
    );
  return h(
    "div",
    { class: "card stack", id: "print-chart" },
    h(
      "div",
      { class: "row spread" },
      h("h2", null, "International Morse Code"),
      h("span", { class: "small muted" }, "ITU-R M.1677"),
    ),
    section("Letters", "letter"),
    section("Numbers", "digit"),
    section("Punctuation", "punctuation"),
    section("Prosigns (sent as one character)", "prosign"),
    h(
      "p",
      { class: "small muted" },
      "Timing: dit = 1 unit, dah = 3, gap inside a letter = 1, between letters = 3, between words = 7. One unit = 1200 ÷ WPM ms.",
    ),
    h("p", { class: "small muted" }, "VSA Morse Code Trainer · vsa.edu.in/software"),
  );
}

export default function referencePage(): Page {
  let tab: TabId = "letter";
  let query = "";
  const body = h("div", { class: "stack" });
  const tabs = h("div", { class: "tabs no-print", role: "tablist" });
  const search = h("input", {
    type: "text",
    placeholder: "Search letters, sounds, meanings…",
    "aria-label": "Search",
  });
  search.addEventListener("input", () => ((query = search.value.trim()), render()));

  const render = () => {
    replace(
      tabs,
      TABS.map((t) =>
        h(
          "button",
          {
            class: `tab${t.id === tab ? " active" : ""}`,
            role: "tab",
            "aria-selected": String(t.id === tab),
            onclick: () => ((tab = t.id), audioPlayer.stop(), render()),
          },
          t.label,
        ),
      ),
    );
    search.parentElement?.classList.toggle("hidden", tab === "chart");

    switch (tab) {
      case "letter":
      case "digit":
      case "punctuation":
      case "prosign": {
        const defs = ITU_MORSE_DEFS.filter(
          (d) =>
            d.category === tab &&
            matches(query, d.char, d.name, d.morse, d.rhythm, d.hook, d.exampleWord),
        );
        replace(
          body,
          defs.length
            ? h("div", { class: "char-grid" }, defs.map(charTile))
            : h("p", { class: "muted" }, "Nothing matches your search."),
        );
        break;
      }
      case "qcodes":
        replace(
          body,
          h(
            "table",
            { class: "card" },
            h(
              "tr",
              null,
              h("th", null, "Code"),
              h("th", null, "Question"),
              h("th", null, "Answer"),
              h("th", null, "Use"),
              h("th", null, ""),
            ),
            qcodes
              .filter((q) => matches(query, q.code, q.meaning, q.answer, q.category, q.usage))
              .map((q) =>
                h(
                  "tr",
                  null,
                  h("td", null, h("strong", { class: "mono" }, q.code)),
                  h("td", null, q.meaning),
                  h("td", null, q.answer),
                  h("td", { class: "small muted" }, q.usage),
                  h("td", null, playButton(q.morse, q.code)),
                ),
              ),
          ),
        );
        break;
      case "abbr":
        replace(
          body,
          h(
            "table",
            { class: "card" },
            h(
              "tr",
              null,
              h("th", null, "Abbreviation"),
              h("th", null, "Meaning"),
              h("th", null, "Note"),
              h("th", null, ""),
            ),
            abbreviations
              .filter((a) => matches(query, a.abbr, a.meaning, a.note, a.category))
              .map((a) =>
                h(
                  "tr",
                  null,
                  h("td", null, h("strong", { class: "mono" }, a.abbr)),
                  h("td", null, a.meaning),
                  h("td", { class: "small muted" }, a.note),
                  h("td", null, playButton(a.morse, a.abbr)),
                ),
              ),
          ),
        );
        break;
      case "mirrors":
        replace(
          body,
          h(
            "p",
            { class: "lead" },
            "Some characters are mirror images: swap every dit for a dah and you get the partner. Learning them in pairs helps your ear tell them apart.",
          ),
          h(
            "div",
            { class: "char-grid" },
            MIRROR_PAIRS.filter((m) => matches(query, m.char1, m.char2, m.morse1, m.morse2)).map(
              (m) =>
                h(
                  "div",
                  { class: "char-tile" },
                  h(
                    "div",
                    { class: "row spread" },
                    h(
                      "span",
                      { class: "glyph" },
                      m.isSelfMirror ? m.char1 : `${m.char1} ↔ ${m.char2}`,
                    ),
                    m.isSelfMirror ? h("span", { class: "chip" }, "self-mirror") : null,
                  ),
                  h("div", { class: "row" }, morseGlyph(m.morse1), playButton(m.morse1, m.char1)),
                  m.isSelfMirror
                    ? null
                    : h(
                        "div",
                        { class: "row" },
                        morseGlyph(m.morse2),
                        playButton(m.morse2, m.char2),
                      ),
                ),
            ),
          ),
        );
        break;
      case "history":
        replace(
          body,
          h(
            "div",
            { class: "card" },
            h("h3", null, american.title),
            h("p", null, american.overview),
          ),
          h(
            "div",
            { class: "grid three" },
            american.keyDifferences.map((k) =>
              h(
                "div",
                { class: "card" },
                h("h3", null, k.aspect),
                h("p", { class: "small" }, h("strong", null, "American: "), k.americanMorse),
                h(
                  "p",
                  { class: "small" },
                  h("strong", null, "International: "),
                  k.internationalMorse,
                ),
              ),
            ),
          ),
          h(
            "table",
            { class: "card" },
            h(
              "tr",
              null,
              h("th", null, "Char"),
              h("th", null, "American (railroad)"),
              h("th", null, "International"),
              h("th", null, "Note"),
            ),
            american.comparisonTable.map((r) =>
              h(
                "tr",
                null,
                h("td", null, h("strong", null, r.char)),
                h("td", { class: "mono" }, r.american),
                h("td", null, morseGlyph(r.international)),
                h("td", { class: "small muted" }, r.note),
              ),
            ),
          ),
        );
        break;
      case "chart":
        replace(
          body,
          h(
            "div",
            { class: "row no-print" },
            h(
              "button",
              { class: "btn", onclick: () => window.print() },
              icon("print", "icon sm"),
              "Print chart (or save as PDF)",
            ),
            h(
              "span",
              { class: "small muted" },
              "In the print window choose your printer, or “Save as PDF”.",
            ),
          ),
          printableChart(),
        );
        break;
    }
  };

  render();
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack no-print" },
      h("h2", null, "Reference Library"),
      h("p", { class: "lead" }, "Click any character to hear it at your own speed and pitch."),
    ),
    tabs,
    h("div", { class: "no-print" }, search),
    body,
  );
  return { el };
}
