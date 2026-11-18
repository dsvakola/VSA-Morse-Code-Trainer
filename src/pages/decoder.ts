/**
 * Audio Decoder — open a WAV recording of Morse; Rust finds the tone and its on/off timing,
 * then the same classifier used for the sending key turns it into text.
 */

import { chooseOpenPath, decodeAudioFile, errorText, isDesktop, type DecodedSignal } from "../api";
import { classifyTappingStream, type TappingRawPress } from "../engine";
import { h, replace, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

export function segmentsToPresses(signal: DecodedSignal): TappingRawPress[] {
  const presses: TappingRawPress[] = [];
  for (const seg of signal.segments) {
    if (seg.on) presses.push({ pressMs: seg.durationMs, gapMs: 0 });
    else if (presses.length) presses[presses.length - 1].gapMs += seg.durationMs;
  }
  if (presses.length) presses[presses.length - 1].gapMs = 0;
  return presses;
}

function drawTimeline(signal: DecodedSignal): HTMLCanvasElement {
  const canvas = h("canvas", {
    class: "timeline",
    height: 70,
    width: 1000,
    "aria-label": "Tone on and off over time",
  }) as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const css = getComputedStyle(document.documentElement);
  const total = Math.max(1, signal.durationMs);
  ctx.fillStyle = css.getPropertyValue("--paper-200").trim() || "#efe3c8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = css.getPropertyValue("--mahogany-800").trim() || "#5a2414";
  let t = 0;
  for (const seg of signal.segments) {
    const x = (t / total) * canvas.width;
    const w = Math.max(1, (seg.durationMs / total) * canvas.width);
    if (seg.on) ctx.fillRect(x, 18, w, 34);
    t += seg.durationMs;
  }
  return canvas;
}

export default function decoderPage(): Page {
  const result = h("div", { class: "stack" });

  const open = async () => {
    if (!isDesktop()) return toast("Opening audio files works in the desktop app.", "error");
    try {
      const path = await chooseOpenPath({ name: "WAV audio", extensions: ["wav"] });
      if (!path) return;
      replace(result, h("p", { class: "muted" }, "Listening to the recording…"));
      const signal = await decodeAudioFile(path);
      const presses = segmentsToPresses(signal);
      if (!presses.length) {
        replace(
          result,
          h(
            "div",
            { class: "feedback bad" },
            "No clear Morse tone was found in this recording. Try a cleaner recording with a single steady tone.",
          ),
        );
        return;
      }
      const c = classifyTappingStream(presses);
      const fileName = path.split(/[\\/]/).pop() ?? path;
      replace(
        result,
        h(
          "section",
          { class: "card stack" },
          h("div", { class: "row" }, h("span", { class: "plaque" }, fileName)),
          h(
            "div",
            { class: "grid four" },
            h(
              "div",
              { class: "stat" },
              h("b", null, `${Math.round(signal.toneHz)} Hz`),
              h("span", null, "Tone"),
            ),
            h(
              "div",
              { class: "stat" },
              h("b", null, `${c.estimatedWpm}`),
              h("span", null, "Speed (WPM)"),
            ),
            h(
              "div",
              { class: "stat" },
              h("b", null, `${(signal.durationMs / 1000).toFixed(1)} s`),
              h("span", null, "Length"),
            ),
            h(
              "div",
              { class: "stat" },
              h("b", null, `${presses.length}`),
              h("span", null, "Dits and dahs"),
            ),
          ),
          drawTimeline(signal),
          h("h3", null, "Decoded text"),
          h(
            "div",
            { class: "morse-text card mono", style: { fontSize: "1.4rem", userSelect: "text" } },
            c.decodedText || "—",
          ),
          h(
            "div",
            { class: "morse-text small mono", style: { userSelect: "text" } },
            c.decodedMorse,
          ),
          h(
            "div",
            { class: "row" },
            h(
              "button",
              {
                class: "btn",
                onclick: () =>
                  navigator.clipboard.writeText(c.decodedText).then(() => toast("Text copied.")),
              },
              icon("copy", "icon sm"),
              "Copy text",
            ),
          ),
        ),
      );
    } catch (e) {
      replace(result, h("div", { class: "feedback bad" }, errorText(e)));
    }
  };

  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Audio Decoder"),
      h(
        "p",
        { class: "lead" },
        "Open a WAV recording of Morse code and the trainer will find the tone, measure every dit and dah, and write out the message.",
      ),
    ),
    h(
      "section",
      { class: "card stack" },
      h(
        "div",
        { class: "row" },
        h(
          "button",
          { class: "btn big", onclick: () => void open() },
          icon("upload", "icon sm"),
          "Open a WAV file…",
        ),
      ),
      h(
        "ul",
        { class: "small muted" },
        h(
          "li",
          null,
          "Works best with one clear tone between 300 and 1500 Hz and little background noise.",
        ),
        h(
          "li",
          null,
          "Recordings saved from this app's Translator decode perfectly; try one first.",
        ),
        h("li", null, "Everything happens on your computer. Nothing is uploaded."),
      ),
    ),
    result,
  );
  return { el };
}
