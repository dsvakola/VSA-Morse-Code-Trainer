/**
 * Translator — text to Morse and back as you type, with sound, signal lamp, full-screen flash
 * and WAV export (written by Rust to the place the user chooses).
 */

import { audioPlayer } from "../audio/playback";
import { chooseSavePath, errorText, exportWav, isDesktop } from "../api";
import {
  decodeMorseToText,
  encodeTextToMorse,
  getTotalDurationMs,
  scheduleMorseEvents,
  type MorseEvent,
} from "../engine";
import { getSettings, updateSettings } from "../state/settings";
import { h, replace, slider, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { signalLamp } from "../ui/morse";
import { telegraphKey } from "../ui/telegraph-key";

const EXAMPLES = [
  { label: "First telegram, 1844", text: "WHAT HATH GOD WROUGHT" },
  { label: "Titanic distress, 1912", text: "CQD CQD SOS DE MGY" },
  { label: "Calling any station", text: "CQ CQ CQ DE K1ABC K" },
  { label: "Best regards", text: "73 ES GL" },
];

type Mode = "toMorse" | "toText";

export default function translatorPage(): Page {
  let mode: Mode = "toMorse";
  let playing = false;
  const lamp = signalLamp(true);
  const key = telegraphKey();
  key.el.style.maxWidth = "230px";
  const currentChar = h("div", { class: "big-char", style: { minHeight: "3rem" } }, "");

  const input = h("textarea", {
    "aria-label": "Text to translate",
    spellcheck: "false",
  }) as HTMLTextAreaElement;
  input.value = EXAMPLES[0].text;
  const output = h("div", {
    class: "morse-text card",
    style: { minHeight: "120px" },
    "aria-live": "polite",
  });
  const info = h("p", { class: "small muted" });
  const warn = h("div");
  const modeTabs = h("div", { class: "tabs" });
  const playBtn = h("button", { class: "btn big" });
  const loopBox = h("input", { type: "checkbox" }) as HTMLInputElement;

  const morseNow = (): string =>
    mode === "toMorse" ? encodeTextToMorse(input.value).morse : input.value.trim();

  const events = (): MorseEvent[] => {
    const s = getSettings();
    return scheduleMorseEvents(morseNow(), {
      charSpeedWpm: s.charSpeedWpm,
      effectiveSpeedWpm: s.effectiveSpeedWpm,
    });
  };

  const translate = () => {
    if (mode === "toMorse") {
      const r = encodeTextToMorse(input.value);
      output.textContent = r.morse || "—";
      replace(
        warn,
        r.unsupportedChars.length
          ? h(
              "div",
              { class: "feedback bad" },
              `Skipped characters with no Morse code: ${[...new Set(r.unsupportedChars.map((u) => u.char))].join(" ")}`,
            )
          : null,
      );
    } else {
      const r = decodeMorseToText(input.value);
      output.textContent = r.text || "—";
      replace(
        warn,
        r.unknownPatterns.length
          ? h(
              "div",
              { class: "feedback bad" },
              `Unknown patterns shown as “?”: ${r.unknownPatterns.map((u) => u.pattern).join("  ")}`,
            )
          : null,
      );
    }
    const ev = events();
    const seconds = getTotalDurationMs(ev) / 1000;
    info.textContent = `${input.value.length} characters typed · about ${seconds.toFixed(1)} s to send at your speed`;
  };

  const setPlaying = (on: boolean) => {
    playing = on;
    replace(playBtn, icon(on ? "stop" : "play", "icon sm"), on ? "Stop" : "Play");
    if (!on) {
      lamp.set(false);
      key.setPressed(false);
      currentChar.textContent = "";
    }
  };

  const play = (onTone?: (on: boolean) => void) => {
    const ev = events();
    if (!ev.length) return;
    const s = getSettings();
    setPlaying(true);
    void audioPlayer.playEvents(ev, {
      pitchHz: s.pitchHz,
      volumePct: s.volumePct,
      noiseLevelPct: s.noiseLevel,
      loop: loopBox.checked,
      onEventStart: (e) => {
        const on = e.type === "on";
        lamp.set(on);
        key.setPressed(on);
        onTone?.(on);
        if (on && e.char) currentChar.textContent = e.char;
      },
      onEventEnd: () => {
        lamp.set(false);
        key.setPressed(false);
        onTone?.(false);
      },
      onFinished: () => setPlaying(false),
    });
  };

  playBtn.addEventListener("click", () => {
    if (playing) {
      audioPlayer.stop();
      setPlaying(false);
    } else play();
  });

  const flash = () => {
    const screen = h(
      "div",
      { class: "flash-screen", role: "dialog", "aria-label": "Screen flash" },
      h("p", null, "Signal flash — click or press Esc to close"),
    );
    const close = () => {
      audioPlayer.stop();
      setPlaying(false);
      screen.remove();
      window.removeEventListener("keydown", onKey);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    screen.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    document.body.append(screen);
    play((on) => screen.classList.toggle("on", on));
  };

  const saveWav = async () => {
    const ev = events();
    if (!ev.length) return;
    if (!isDesktop()) {
      toast("WAV export works in the desktop app.", "error");
      return;
    }
    try {
      const base =
        (mode === "toMorse" ? input.value : "morse-message")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 32) || "morse";
      const path = await chooseSavePath(`${base}.wav`, { name: "WAV sound", extensions: ["wav"] });
      if (!path) return;
      const s = getSettings();
      await exportWav(
        path,
        ev.map((e) => ({ on: e.type === "on", durationMs: e.durationMs })),
        s.pitchHz,
        s.volumePct / 100,
      );
      toast("WAV file saved.");
    } catch (err) {
      toast(errorText(err), "error");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output.textContent ?? "");
      toast("Copied to the clipboard.");
    } catch {
      toast("Could not copy.", "error");
    }
  };

  const renderTabs = () =>
    replace(
      modeTabs,
      (
        [
          ["toMorse", "Text → Morse"],
          ["toText", "Morse → Text"],
        ] as const
      ).map(([m, label]) =>
        h(
          "button",
          {
            class: `tab${m === mode ? " active" : ""}`,
            onclick: () => {
              if (m === mode) return;
              audioPlayer.stop();
              setPlaying(false);
              // Carry the content across so the student sees the same message both ways.
              input.value =
                mode === "toMorse"
                  ? encodeTextToMorse(input.value).morse
                  : decodeMorseToText(input.value).text;
              mode = m;
              input.placeholder =
                mode === "toMorse"
                  ? "Type your message…"
                  : "Type dots and dashes, e.g.  ... --- ...  (use / between words)";
              renderTabs();
              translate();
            },
          },
          label,
        ),
      ),
    );

  input.addEventListener("input", translate);
  renderTabs();
  setPlaying(false);
  translate();

  const s = getSettings();
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "row spread" },
      h(
        "div",
        { class: "stack" },
        h("h2", null, "Translator"),
        h(
          "p",
          { class: "lead" },
          "Translate as you type, then listen, watch the lamp, or flash the screen.",
        ),
      ),
      modeTabs,
    ),
    h(
      "div",
      { class: "grid two" },
      h(
        "div",
        { class: "stack" },
        h("label", { class: "field" }, mode === "toMorse" ? "Your message" : "Morse", input),
        info,
        warn,
        h(
          "div",
          { class: "row" },
          h("span", { class: "small muted" }, "Try:"),
          EXAMPLES.map((ex) =>
            h(
              "button",
              {
                class: "chip",
                onclick: () => (
                  (input.value = mode === "toMorse" ? ex.text : encodeTextToMorse(ex.text).morse),
                  translate()
                ),
              },
              ex.label,
            ),
          ),
        ),
      ),
      h(
        "div",
        { class: "stack" },
        h("span", { class: "field" }, "Translation"),
        output,
        h(
          "div",
          { class: "row" },
          h("button", { class: "btn ghost", onclick: copy }, icon("copy", "icon sm"), "Copy"),
        ),
      ),
    ),
    h(
      "div",
      { class: "panel-dark" },
      h(
        "div",
        { class: "grid three", style: { alignItems: "center" } },
        h(
          "div",
          { class: "row", style: { justifyContent: "center", gap: "18px" } },
          lamp.el,
          currentChar,
        ),
        key.el,
        h(
          "div",
          { class: "stack" },
          slider({
            label: "Character speed",
            min: 5,
            max: 40,
            value: s.charSpeedWpm,
            unit: " WPM",
            onInput: (v) =>
              updateSettings({
                charSpeedWpm: v,
                effectiveSpeedWpm: Math.min(getSettings().effectiveSpeedWpm, v),
              }),
          }),
          slider({
            label: "Farnsworth speed",
            min: 3,
            max: 40,
            value: s.effectiveSpeedWpm,
            unit: " WPM",
            onInput: (v) => updateSettings({ effectiveSpeedWpm: v }),
          }),
          slider({
            label: "Tone",
            min: 300,
            max: 1000,
            step: 10,
            value: s.pitchHz,
            unit: " Hz",
            onInput: (v) => updateSettings({ pitchHz: v }),
          }),
        ),
      ),
      h(
        "div",
        { class: "row", style: { marginTop: "14px" } },
        playBtn,
        h("label", { class: "check" }, loopBox, "Repeat"),
        h(
          "button",
          { class: "btn ebony", onclick: flash },
          icon("lamp", "icon sm"),
          "Screen flash",
        ),
        h(
          "button",
          { class: "btn ebony", onclick: () => void saveWav() },
          icon("download", "icon sm"),
          "Save as WAV",
        ),
      ),
    ),
  );
  input.addEventListener("input", () => audioPlayer.getIsPlaying() || setPlaying(false));
  return { el, dispose: () => document.querySelector(".flash-screen")?.remove() };
}
