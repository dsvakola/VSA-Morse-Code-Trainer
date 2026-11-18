/**
 * Sending Key — practise sending with a straight key (keyboard or mouse) or iambic paddles.
 * What you send is decoded live and scored for accuracy and rhythm.
 */

import { audioPlayer } from "../audio/playback";
import { classifyTappingStream, scoreSendingPerformance, type TappingRawPress } from "../engine";
import { getProgress, startPracticeTimer, updateProgress } from "../state/progress";
import { getSettings } from "../state/settings";
import { h, replace, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { morseGlyph, patternOf, playText, signalLamp, stopPlayback } from "../ui/morse";
import { telegraphKey } from "../ui/telegraph-key";

const TARGETS = [
  "E T",
  "PARIS",
  "SOS",
  "CQ CQ",
  "73",
  "VSA",
  "THE QUICK BROWN FOX",
  "DE K1ABC K",
  "MORSE CODE",
  "HELLO WORLD",
];

const DIT_KEYS = new Set(["ControlLeft", "BracketLeft"]);
const DAH_KEYS = new Set(["ControlRight", "BracketRight"]);

export default function keyerPage(): Page {
  const stopTimer = startPracticeTimer();
  const settings = getSettings();
  const unitMs = () => 1200 / getSettings().charSpeedWpm;
  const lamp = signalLamp(true);
  const key = telegraphKey();

  // ---------- the recorder (shared by straight key and paddles) ----------
  const presses: TappingRawPress[] = [];
  let downAt = 0;
  let upAt = 0;
  let isDown = false;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const keyDown = () => {
    if (isDown) return;
    isDown = true;
    const now = performance.now();
    if (presses.length && upAt) presses[presses.length - 1].gapMs = now - upAt;
    downAt = now;
    if (idleTimer) clearTimeout(idleTimer);
    const s = getSettings();
    audioPlayer.startSidetone(s.pitchHz, s.volumePct);
    lamp.set(true);
    key.setPressed(true);
  };

  const keyUp = () => {
    if (!isDown) return;
    isDown = false;
    upAt = performance.now();
    presses.push({ pressMs: upAt - downAt, gapMs: 0 });
    audioPlayer.stopSidetone();
    lamp.set(false);
    key.setPressed(false);
    showDecoded();
    if (idleTimer) clearTimeout(idleTimer);
    // After a long pause, mark a word space so the next letters start a new word.
    idleTimer = setTimeout(
      () => {
        if (presses.length) presses[presses.length - 1].gapMs = 7 * unitMs();
        showDecoded();
      },
      Math.max(1200, 7 * unitMs()),
    );
  };

  // ---------- iambic paddles ----------
  let ditDown = false;
  let dahDown = false;
  let ditMemory = false;
  let dahMemory = false;
  let squeezed = false;
  let running = false;
  let last: "dit" | "dah" | null = null;
  let paddleTimer: ReturnType<typeof setTimeout> | null = null;

  const nextElement = (): "dit" | "dah" | null => {
    if (ditDown && dahDown) return last === "dit" ? "dah" : "dit";
    if (ditMemory && dahMemory) return last === "dit" ? "dah" : "dit";
    if (ditDown || ditMemory) return "dit";
    if (dahDown || dahMemory) return "dah";
    if (getSettings().keyMode === "iambic-b" && squeezed && last)
      return last === "dit" ? "dah" : "dit";
    return null;
  };

  const sendNext = () => {
    const el = nextElement();
    if (!el) {
      running = false;
      last = null;
      return;
    }
    running = true;
    last = el;
    if (el === "dit") ditMemory = false;
    else dahMemory = false;
    squeezed = ditDown && dahDown;
    const u = unitMs();
    keyDown();
    paddleTimer = setTimeout(
      () => {
        keyUp();
        paddleTimer = setTimeout(sendNext, u);
      },
      el === "dit" ? u : 3 * u,
    );
  };

  const paddle = (which: "dit" | "dah", down: boolean) => {
    if (which === "dit") ditDown = down;
    else dahDown = down;
    if (down) {
      if (running && which === "dit") ditMemory = true;
      else if (running) dahMemory = true;
      if (ditDown && dahDown) squeezed = true;
      if (!running) sendNext();
    }
  };

  // ---------- keyboard and mouse ----------
  const onKeyDown = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("input, textarea, select")) return;
    const s = getSettings();
    if (s.keyMode === "straight") {
      if (e.code !== s.keyBinding) return;
      e.preventDefault();
      if (!e.repeat) keyDown();
    } else if (DIT_KEYS.has(e.code) || DAH_KEYS.has(e.code)) {
      e.preventDefault();
      if (!e.repeat) paddle(DIT_KEYS.has(e.code) ? "dit" : "dah", true);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    const s = getSettings();
    if (s.keyMode === "straight") {
      if (e.code === s.keyBinding) {
        e.preventDefault();
        keyUp();
      }
    } else if (DIT_KEYS.has(e.code) || DAH_KEYS.has(e.code)) {
      e.preventDefault();
      paddle(DIT_KEYS.has(e.code) ? "dit" : "dah", false);
    }
  };
  const onBlur = () => {
    ditDown = dahDown = ditMemory = dahMemory = false;
    keyUp();
  };
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  key.el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    key.el.setPointerCapture(e.pointerId);
    if (getSettings().keyMode === "straight") keyDown();
    else paddle(e.button === 2 ? "dah" : "dit", true);
  });
  const pointerUp = (e: PointerEvent) => {
    if (getSettings().keyMode === "straight") keyUp();
    else paddle(e.button === 2 ? "dah" : "dit", false);
  };
  key.el.addEventListener("pointerup", pointerUp);
  key.el.addEventListener("pointercancel", pointerUp);
  key.el.addEventListener("contextmenu", (e) => e.preventDefault());

  // ---------- screen ----------
  let target = TARGETS[1];
  const targetBox = h("div", { class: "row" });
  const decodedText = h("div", {
    class: "big-char mono",
    "aria-live": "polite",
    style: { minHeight: "3rem", fontSize: "2rem" },
  });
  const decodedMorse = h("div", { class: "morse-text small" });
  const report = h("div", { class: "stack" });
  const speedNote = h("span", { class: "small muted" });

  const classify = () =>
    classifyTappingStream(
      presses,
      getSettings().keyMode === "straight" ? undefined : unitMs(),
      unitMs(),
    );

  function showDecoded() {
    const c = classify();
    decodedText.textContent = c.decodedText || "…";
    decodedMorse.textContent = c.decodedMorse;
    speedNote.textContent = presses.length ? `About ${c.estimatedWpm} WPM` : "";
  }

  const clear = () => {
    presses.length = 0;
    upAt = 0;
    decodedText.textContent = "…";
    decodedMorse.textContent = "";
    speedNote.textContent = "";
    replace(report);
  };

  const score = () => {
    if (!presses.length) return;
    const r = scoreSendingPerformance(target, classify());
    if (r.overallScore > getProgress().sendingBest)
      updateProgress((p) => (p.sendingBest = r.overallScore));
    replace(
      report,
      h(
        "div",
        { class: "grid four" },
        h("div", { class: "stat" }, h("b", null, `${r.overallScore}`), h("span", null, "Overall")),
        h(
          "div",
          { class: "stat" },
          h("b", null, `${r.accuracyScore}%`),
          h("span", null, "Accuracy"),
        ),
        h("div", { class: "stat" }, h("b", null, `${r.timingScore}`), h("span", null, "Rhythm")),
        h(
          "div",
          { class: "stat" },
          h("b", null, `${r.dashDotRatio}:1`),
          h("span", null, "Dah to dit (ideal 3:1)"),
        ),
      ),
      r.feedbackTips.length
        ? h(
            "ul",
            null,
            r.feedbackTips.map((t) => h("li", null, t)),
          )
        : h("div", { class: "feedback ok" }, "Clean, even sending. Well done!"),
      h("p", { class: "small muted" }, `Your best score so far: ${getProgress().sendingBest}.`),
    );
  };

  const renderTarget = () => {
    replace(
      targetBox,
      h("span", { class: "plaque" }, "Send this"),
      h("span", { class: "mono", style: { fontSize: "1.5rem" } }, target),
      h(
        "button",
        { class: "btn ghost", onclick: () => void playText(target, { lamp, noise: false }) },
        icon("play", "icon sm"),
        "Hear it",
      ),
      h(
        "div",
        { class: "row" },
        [...target.replace(/\s+/g, "")].slice(0, 8).map((ch) => morseGlyph(patternOf(ch))),
      ),
    );
  };

  const select = h(
    "select",
    {
      "aria-label": "Practice text",
      onchange: (e: Event) => (
        (target = (e.target as HTMLSelectElement).value),
        renderTarget(),
        clear()
      ),
    },
    TARGETS.map((t) => h("option", { value: t, selected: t === target }, t)),
  );

  const modeNote =
    settings.keyMode === "straight"
      ? `Straight key: hold ${settings.keyBinding === "Space" ? "the Space bar" : settings.keyBinding} (or press the brass key with the mouse). Short press = dit, long press = dah.`
      : `Iambic paddles (mode ${settings.keyMode === "iambic-a" ? "A" : "B"}): Left Ctrl or [ sends dits, Right Ctrl or ] sends dahs. Squeeze both to alternate. With the mouse: left button dit, right button dah.`;

  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Sending Key"),
      h("p", { class: "lead" }, modeNote),
      h("p", { class: "small muted" }, "You can change the key, style and speed in Settings."),
    ),
    h(
      "section",
      { class: "card stack" },
      h("label", { class: "field" }, "Practice text", select),
      targetBox,
    ),
    h(
      "section",
      { class: "panel-dark key-station keyer-station" },
      key.el,
      h("div", { class: "row" }, lamp.el, speedNote),
    ),
    h(
      "section",
      { class: "card stack" },
      h("h3", null, "What you sent"),
      decodedText,
      decodedMorse,
      h(
        "div",
        { class: "row" },
        h(
          "button",
          { class: "btn big", onclick: score },
          icon("check", "icon sm"),
          "Score my sending",
        ),
        h("button", { class: "btn ghost", onclick: clear }, icon("trash", "icon sm"), "Clear"),
      ),
      report,
    ),
  );

  renderTarget();
  clear();
  return {
    el,
    dispose: () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      if (idleTimer) clearTimeout(idleTimer);
      if (paddleTimer) clearTimeout(paddleTimer);
      audioPlayer.stopSidetone();
      stopPlayback(lamp);
      stopTimer();
    },
  };
}
