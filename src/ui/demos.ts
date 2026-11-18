/**
 * Interactive teaching demos for the Fundamentals course:
 * the 1-3-7 timeline, the 50-unit word PARIS, and Farnsworth spacing.
 */

import {
  calculateTiming,
  encodeTextToMorse,
  scheduleMorseEvents,
  type MorseEvent,
} from "../engine";
import { audioPlayer } from "../audio/playback";
import { getSettings } from "../state/settings";
import { h, replace, slider } from "./dom";
import { icon } from "./icons";
import { signalLamp } from "./morse";

const KIND_LABEL: Record<NonNullable<MorseEvent["kind"]>, string> = {
  dit: "dit · 1",
  dah: "dah · 3",
  "intra-char-gap": "gap · 1",
  "inter-char-gap": "letter gap · 3",
  "inter-word-gap": "word gap · 7",
};

/** Draws a timeline of proportional blocks: brass = tone, paper = silence. */
function timelineBar(
  events: MorseEvent[],
  unitMs: number,
): { el: HTMLElement; blocks: HTMLElement[] } {
  const blocks = events.map((ev) => {
    const units = Math.round(ev.durationMs / unitMs);
    return h(
      "div",
      {
        title: ev.kind ? KIND_LABEL[ev.kind] : "",
        style: {
          flex: `${units} 0 0`,
          height: ev.type === "on" ? "26px" : "10px",
          alignSelf: "center",
          borderRadius: "5px",
          background: ev.type === "on" ? "var(--brass-grad-flat)" : "var(--paper-200)",
          border: ev.type === "on" ? "1px solid var(--brass-700)" : "1px dashed var(--paper-400)",
          transition: "box-shadow .05s",
        },
      },
      units > 1
        ? h(
            "span",
            {
              class: "small mono",
              style: { display: "block", textAlign: "center", fontSize: "0.65rem" },
            },
            String(units),
          )
        : null,
    );
  });
  return {
    el: h("div", { style: { display: "flex", gap: "2px", minHeight: "34px" } }, blocks),
    blocks,
  };
}

function playWithHighlight(
  events: MorseEvent[],
  blocks: HTMLElement[],
  onUnit?: (i: number) => void,
): void {
  const s = getSettings();
  void audioPlayer.playEvents(events, {
    pitchHz: s.pitchHz,
    volumePct: s.volumePct,
    onEventStart: (_ev, i) => {
      blocks.forEach((b, j) => (b.style.boxShadow = j === i ? "0 0 0 3px var(--lamp-on)" : ""));
      onUnit?.(i);
    },
    onFinished: () => blocks.forEach((b) => (b.style.boxShadow = "")),
  });
}

export function timelineDemo(): HTMLElement {
  const input = h("input", {
    type: "text",
    value: "SOS",
    maxlength: "12",
    "aria-label": "Word to draw",
  });
  const holder = h("div");
  let current: { events: MorseEvent[]; blocks: HTMLElement[] } = { events: [], blocks: [] };
  const draw = () => {
    const events = scheduleMorseEvents(encodeTextToMorse(input.value).morse, {
      charSpeedWpm: 12,
      effectiveSpeedWpm: 12,
    });
    const bar = timelineBar(events, 100);
    current = { events, blocks: bar.blocks };
    const units = events.reduce((n, e) => n + Math.round(e.durationMs / 100), 0);
    replace(
      holder,
      bar.el,
      h(
        "p",
        { class: "small muted" },
        `${units} units in total. Brass = tone, dashed = silence. Hover a block to see its length.`,
      ),
    );
  };
  input.addEventListener("input", draw);
  draw();
  return h(
    "div",
    { class: "panel-dark stack" },
    h("h3", null, "Try it: the 1-3-7 timeline"),
    h(
      "div",
      { class: "row" },
      h("div", { style: { flex: "1" } }, input),
      h(
        "button",
        { class: "btn", onclick: () => playWithHighlight(current.events, current.blocks) },
        icon("play", "icon sm"),
        "Play slowly",
      ),
    ),
    holder,
  );
}

export function parisDemo(): HTMLElement {
  const events = scheduleMorseEvents(encodeTextToMorse("PARIS").morse + " / ", {
    charSpeedWpm: 12,
    effectiveSpeedWpm: 12,
  });
  // Add the trailing word gap so the count reaches exactly 50.
  events.push({ type: "off", durationMs: 700, kind: "inter-word-gap" });
  const bar = timelineBar(events, 100);
  const counter = h("b", { class: "big-char" }, "0");
  const unitsBefore: number[] = [];
  events.reduce((n, e, i) => ((unitsBefore[i] = n), n + Math.round(e.durationMs / 100)), 0);
  const play = () =>
    playWithHighlight(events, bar.blocks, (i) => {
      counter.textContent = String(unitsBefore[i] + Math.round(events[i].durationMs / 100));
    });
  return h(
    "div",
    { class: "panel-dark stack" },
    h("h3", null, "Try it: count the units in PARIS"),
    bar.el,
    h(
      "div",
      { class: "row spread" },
      h("div", { class: "row" }, counter, h("span", null, "of 50 units")),
      h("button", { class: "btn", onclick: play }, icon("play", "icon sm"), "Send PARIS and count"),
    ),
    h(
      "p",
      { class: "small" },
      "50 units make one word, so at W words per minute one unit lasts 60 000 ÷ (50 × W) = 1200 ÷ W milliseconds.",
    ),
  );
}

export function farnsworthDemo(): HTMLElement {
  let charWpm = 20;
  let effWpm = 8;
  const table = h("div");
  const lamp = signalLamp();
  const update = () => {
    const t = calculateTiming({ charSpeedWpm: charWpm, effectiveSpeedWpm: effWpm });
    replace(
      table,
      h(
        "table",
        null,
        h("tr", null, h("th", null, "Part"), h("th", null, "Length")),
        h("tr", null, h("td", null, "Dit"), h("td", { class: "mono" }, `${t.ditMs.toFixed(0)} ms`)),
        h("tr", null, h("td", null, "Dah"), h("td", { class: "mono" }, `${t.dahMs.toFixed(0)} ms`)),
        h(
          "tr",
          null,
          h("td", null, "Gap between letters"),
          h("td", { class: "mono" }, `${t.interCharGapMs.toFixed(0)} ms`),
        ),
        h(
          "tr",
          null,
          h("td", null, "Gap between words"),
          h("td", { class: "mono" }, `${t.interWordGapMs.toFixed(0)} ms`),
        ),
      ),
    );
  };
  update();
  const play = (eff: number) => {
    const s = getSettings();
    const events = scheduleMorseEvents(encodeTextToMorse("CQ DE VSA").morse, {
      charSpeedWpm: charWpm,
      effectiveSpeedWpm: eff,
    });
    void audioPlayer.playEvents(events, {
      pitchHz: s.pitchHz,
      volumePct: s.volumePct,
      onEventStart: (ev) => lamp.set(ev.type === "on"),
      onEventEnd: () => lamp.set(false),
      onFinished: () => lamp.set(false),
    });
  };
  return h(
    "div",
    { class: "panel-dark stack" },
    h("h3", null, "Try it: Farnsworth spacing"),
    h(
      "div",
      { class: "grid two" },
      slider({
        label: "Character speed",
        min: 10,
        max: 35,
        value: charWpm,
        unit: " WPM",
        onInput: (v) => ((charWpm = v), (effWpm = Math.min(effWpm, v)), update()),
      }),
      slider({
        label: "Overall (Farnsworth) speed",
        min: 3,
        max: 35,
        value: effWpm,
        unit: " WPM",
        onInput: (v) => ((effWpm = Math.min(v, charWpm)), update()),
      }),
    ),
    h("div", { class: "row" }, lamp.el, h("div", { style: { flex: "1" } }, table)),
    h(
      "div",
      { class: "row" },
      h(
        "button",
        { class: "btn", onclick: () => play(effWpm) },
        icon("play", "icon sm"),
        "Farnsworth timing",
      ),
      h(
        "button",
        { class: "btn ebony", onclick: () => play(Math.max(3, Math.round(effWpm))) },
        "Same, letters slowed instead",
      ),
      h(
        "button",
        { class: "btn ghost", onclick: () => audioPlayer.stop() },
        icon("stop", "icon sm"),
        "Stop",
      ),
    ),
    h(
      "p",
      { class: "small" },
      "Notice: the letters keep their crisp full-speed sound; only the silences between them grow.",
    ),
  );
}
