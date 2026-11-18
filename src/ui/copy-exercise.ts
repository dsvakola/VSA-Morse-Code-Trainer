/**
 * A listening exercise used by Lessons, Koch and Drills: Morse is played, the student types what
 * they heard, and each character is marked right or wrong.
 */

import { recordAnswer } from "../state/progress";
import { compareCopy } from "./copy-check";
import { h, replace } from "./dom";
import { icon } from "./icons";
import { playText, signalLamp, stopPlayback } from "./morse";

export interface CopyResult {
  correct: number;
  total: number;
  pct: number;
}

export interface CopyExercise {
  el: HTMLElement;
  /** Loads new text to copy (not played until the student presses Play). */
  load: (text: string) => void;
  dispose: () => void;
}

export function copyExercise(opts: {
  /** Shown above the answer box. */
  prompt?: string;
  /** Called after the student checks the answer. */
  onChecked?: (r: CopyResult, sent: string) => void;
  /** Record every character in the per-character statistics. */
  recordStats?: boolean;
  /** Offer "Next" after checking. */
  onNext?: () => void;
}): CopyExercise {
  let sent = "";
  let checked = false;
  const lamp = signalLamp();
  const answer = h("textarea", {
    class: "mono",
    rows: 3,
    spellcheck: "false",
    autocomplete: "off",
    "aria-label": "Type what you hear",
    placeholder: "Type what you hear…",
  }) as HTMLTextAreaElement;
  const result = h("div", { class: "stack", "aria-live": "polite" });
  const playBtn = h("button", { class: "btn big" }, icon("play", "icon sm"), "Play");
  const checkBtn = h("button", { class: "btn ebony big" }, icon("check", "icon sm"), "Check");
  const nextBtn = h(
    "button",
    { class: "btn ghost big hidden" },
    "Next",
    icon("arrowRight", "icon sm"),
  );

  const play = () => {
    playBtn.disabled = true;
    void playText(sent, { lamp }).then(() => {
      playBtn.disabled = false;
      answer.focus();
    });
  };

  const check = () => {
    if (checked || !sent) return;
    checked = true;
    stopPlayback(lamp);
    const r = compareCopy(sent, answer.value);
    const pct = r.total ? Math.round((r.correct / r.total) * 100) : 0;
    if (opts.recordStats) r.results.forEach((c) => recordAnswer(c.expected, c.correct));
    replace(
      result,
      h(
        "div",
        { class: `feedback ${pct >= 90 ? "ok" : "bad"}` },
        `${r.correct} of ${r.total} correct (${pct}%).`,
      ),
      h(
        "div",
        { class: "copy-marks" },
        r.results.map((c) =>
          h(
            "span",
            {
              class: `copy-mark ${c.correct ? "ok" : "bad"}`,
              title: c.correct ? "Correct" : `Sent ${c.expected}, you typed ${c.got ?? "nothing"}`,
            },
            h("b", null, c.expected),
            c.correct ? null : h("small", null, c.got ?? "–"),
          ),
        ),
      ),
      h("p", { class: "small muted" }, "Sent: ", h("span", { class: "mono" }, sent)),
    );
    if (opts.onNext) nextBtn.classList.remove("hidden");
    opts.onChecked?.({ correct: r.correct, total: r.total, pct }, sent);
  };

  playBtn.addEventListener("click", play);
  checkBtn.addEventListener("click", check);
  nextBtn.addEventListener("click", () => opts.onNext?.());
  answer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (checked) opts.onNext?.();
      else check();
    }
  });

  const el = h(
    "div",
    { class: "card stack" },
    h(
      "div",
      { class: "row" },
      lamp.el,
      playBtn,
      h("span", { class: "small muted" }, "Press Play, listen, then type. Enter checks your copy."),
    ),
    opts.prompt ? h("p", null, opts.prompt) : null,
    answer,
    h("div", { class: "row" }, checkBtn, nextBtn),
    result,
  );

  return {
    el,
    load: (text) => {
      sent = text;
      checked = false;
      answer.value = "";
      replace(result);
      nextBtn.classList.add("hidden");
    },
    dispose: () => stopPlayback(lamp),
  };
}
