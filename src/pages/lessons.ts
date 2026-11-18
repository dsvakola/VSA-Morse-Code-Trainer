/**
 * Guided Lessons — two new characters at a time, then punctuation, prosigns, words and sentences.
 * A lesson is passed when a copy round reaches the pass mark in Settings.
 */

import { LESSONS, type Lesson } from "../content/lessons";
import { getProgress, startPracticeTimer, updateProgress } from "../state/progress";
import { getSettings } from "../state/settings";
import { copyExercise } from "../ui/copy-exercise";
import { h, replace, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { morseGlyph, patternOf, playText, signalLamp, stopPlayback } from "../ui/morse";

const ROUND_LENGTH = 15;

function roundText(lesson: Lesson): string {
  if (lesson.items?.length) {
    const pick = [...lesson.items].sort(() => Math.random() - 0.5).slice(0, 4);
    return pick.join(" ");
  }
  // New characters appear about half the time so they get extra practice.
  const out: string[] = [];
  for (let i = 0; i < ROUND_LENGTH; i++) {
    const pool = Math.random() < 0.5 ? lesson.newChars : lesson.practiceSet;
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  // Groups of five, like a real practice sheet.
  const groups: string[] = [];
  for (let i = 0; i < out.length; i += 5) groups.push(out.slice(i, i + 5).join(""));
  return groups.join(" ");
}

function isUnlocked(n: number): boolean {
  const done = getProgress().lessonsCompleted;
  return n === 1 || done.includes(n - 1) || done.includes(n);
}

export default function lessonsPage(): Page {
  const stopTimer = startPracticeTimer();
  const body = h("div", { class: "page" });
  let current: Lesson | null = null;
  const lamp = signalLamp();

  const exercise = copyExercise({
    recordStats: true,
    onChecked: (r) => {
      if (!current) return;
      const pass = getSettings().unlockAccuracyPct;
      if (r.pct >= pass) {
        const n = current.number;
        if (!getProgress().lessonsCompleted.includes(n)) {
          updateProgress((p) => p.lessonsCompleted.push(n));
          toast(
            `Lesson ${n} passed. ${n < LESSONS.length ? "The next lesson is open." : "You have finished every lesson!"}`,
          );
        }
      } else {
        toast(`You need ${pass}% to pass. Try another round.`);
      }
    },
    onNext: () => current && exercise.load(roundText(current)),
  });

  const showList = () => {
    current = null;
    stopPlayback(lamp);
    exercise.dispose();
    const done = getProgress().lessonsCompleted;
    replace(
      body,
      h(
        "div",
        { class: "stack" },
        h("h2", null, "Guided Lessons"),
        h(
          "p",
          { class: "lead" },
          `${LESSONS.length} short lessons take you from your first two letters to copying real on-air sentences. Pass each one at ${getSettings().unlockAccuracyPct}% to open the next.`,
        ),
        h(
          "div",
          { class: "meter", "aria-label": "Lessons passed" },
          h("span", { style: { width: `${(done.length / LESSONS.length) * 100}%` } }),
        ),
        h("p", { class: "small muted" }, `${done.length} of ${LESSONS.length} lessons passed.`),
      ),
      h(
        "div",
        { class: "grid three" },
        LESSONS.map((l) => {
          const open = isUnlocked(l.number);
          const passed = done.includes(l.number);
          return h(
            "button",
            {
              class: `card lesson-card${open ? "" : " locked"}`,
              disabled: !open,
              onclick: () => showLesson(l),
            },
            h(
              "div",
              { class: "row" },
              h("span", { class: "plaque" }, `Lesson ${l.number}`),
              passed ? h("span", { class: "chip ok" }, icon("check", "icon xs"), "Passed") : null,
            ),
            h("h3", null, l.title),
            l.newChars.length
              ? h(
                  "div",
                  { class: "row" },
                  l.newChars.map((c) => h("span", { class: "mono" }, c.replace(/[<>]/g, ""))),
                )
              : h("p", { class: "small muted" }, `${l.items?.length ?? 0} items`),
          );
        }),
      ),
    );
  };

  const showLesson = (l: Lesson) => {
    current = l;
    exercise.load(roundText(l));
    replace(
      body,
      h(
        "button",
        { class: "btn ghost", onclick: showList },
        icon("arrowLeft", "icon sm"),
        "All lessons",
      ),
      h(
        "div",
        { class: "stack" },
        h("span", { class: "plaque" }, `Lesson ${l.number} of ${LESSONS.length}`),
        h("h2", null, l.title),
        h("p", { class: "lead" }, l.intro),
      ),
      l.newChars.length
        ? h(
            "section",
            { class: "card stack" },
            h("h3", null, "Meet the new sounds"),
            h(
              "div",
              { class: "row" },
              lamp.el,
              h("span", { class: "small muted" }, "Click a card to hear it. Listen several times."),
            ),
            h(
              "div",
              { class: "char-grid" },
              l.newChars.map((c) =>
                h(
                  "button",
                  { class: "char-tile", onclick: () => void playText(c, { lamp, noise: false }) },
                  h("span", { class: "glyph mono" }, c.replace(/[<>]/g, "")),
                  morseGlyph(patternOf(c), true),
                ),
              ),
            ),
          )
        : h(
            "section",
            { class: "card stack" },
            h("h3", null, "What you will hear"),
            h(
              "div",
              { class: "row" },
              lamp.el,
              ...(l.items ?? []).map((w) =>
                h(
                  "button",
                  { class: "chip", onclick: () => void playText(w, { lamp, noise: false }) },
                  w,
                ),
              ),
            ),
          ),
      h("h3", null, "Copy practice"),
      exercise.el,
    );
  };

  showList();
  return {
    el: body,
    dispose: () => {
      exercise.dispose();
      stopPlayback(lamp);
      stopTimer();
    },
  };
}
