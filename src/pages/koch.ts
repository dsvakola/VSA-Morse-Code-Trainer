/**
 * Koch Ear Trainer — characters at full speed from day one; a new one is unlocked when a round
 * reaches the unlock mark. Weak characters come up more often.
 */

import {
  DEFAULT_KOCH_ORDER,
  generateKochRoundGroups,
  getUnlockedKochCharacters,
  shouldUnlockNextCharacter,
  type KochStats,
} from "../engine";
import { getProgress, startPracticeTimer, updateProgress } from "../state/progress";
import { getSettings, updateSettings } from "../state/settings";
import { copyExercise } from "../ui/copy-exercise";
import { h, replace, slider, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

function statsMap(): Map<string, KochStats> {
  const map = new Map<string, KochStats>();
  for (const [character, s] of Object.entries(getProgress().charStats)) {
    map.set(character, {
      character,
      attempts: s.attempts,
      correct: s.correct,
      accuracyPct: s.attempts ? (s.correct / s.attempts) * 100 : 0,
      recentErrors: s.recentErrors,
    });
  }
  return map;
}

export default function kochPage(): Page {
  const stopTimer = startPracticeTimer();
  let groups = 5;
  const grid = h("div", { class: "mastery-grid" });
  const header = h("div", { class: "row" });

  const unlocked = () => getUnlockedKochCharacters(getProgress().kochUnlocked);
  const newRound = () =>
    exercise.load(generateKochRoundGroups(groups, unlocked(), statsMap()).join(" "));

  const exercise = copyExercise({
    recordStats: true,
    onChecked: (r) => {
      const count = getProgress().kochUnlocked;
      if (shouldUnlockNextCharacter(r.pct, count, getSettings().kochUnlockPct)) {
        const next = DEFAULT_KOCH_ORDER[count];
        updateProgress((p) => (p.kochUnlocked = count + 1));
        toast(`Well done! New character unlocked: ${next}`);
      }
      renderGrid();
    },
    onNext: newRound,
  });

  const renderGrid = () => {
    const p = getProgress();
    replace(
      header,
      h(
        "span",
        { class: "plaque" },
        `${p.kochUnlocked} of ${DEFAULT_KOCH_ORDER.length} characters`,
      ),
      h(
        "span",
        { class: "small muted" },
        `Unlock the next one at ${getSettings().kochUnlockPct}% in a round.`,
      ),
    );
    replace(
      grid,
      DEFAULT_KOCH_ORDER.map((c, i) => {
        const s = p.charStats[c];
        const acc = s?.attempts ? Math.round((s.correct / s.attempts) * 100) : null;
        const locked = i >= p.kochUnlocked;
        const cls = locked
          ? "locked"
          : acc === null
            ? ""
            : acc >= 90
              ? "good"
              : acc < 70
                ? "weak"
                : "";
        return h(
          "div",
          {
            class: `mastery ${cls}`,
            title: locked
              ? "Locked"
              : acc === null
                ? "Not tried yet"
                : `${acc}% of ${s?.attempts} answers`,
          },
          c,
          h("small", null, locked ? "—" : acc === null ? "new" : `${acc}%`),
        );
      }),
    );
  };

  const s = getSettings();
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Koch Ear Trainer"),
      h(
        "p",
        { class: "lead" },
        "Start with just K and M at full character speed. Copy a round of five-letter groups; when you reach the mark, a new character joins in. Weak characters come back more often.",
      ),
      header,
    ),
    h(
      "div",
      { class: "grid two" },
      h(
        "section",
        { class: "card stack" },
        h("h3", null, "Round settings"),
        slider({
          label: "Groups per round",
          min: 2,
          max: 10,
          value: groups,
          onInput: (v) => ((groups = v), newRound()),
        }),
        slider({
          label: "Character speed",
          min: 12,
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
          onInput: (v) =>
            updateSettings({ effectiveSpeedWpm: Math.min(v, getSettings().charSpeedWpm) }),
        }),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            { class: "btn ghost", onclick: newRound },
            icon("repeat", "icon sm"),
            "New round",
          ),
          h(
            "button",
            {
              class: "btn ghost",
              onclick: () => {
                if (window.confirm("Start Koch again from K and M? Your other progress is kept.")) {
                  updateProgress((p) => (p.kochUnlocked = 2));
                  renderGrid();
                  newRound();
                }
              },
            },
            icon("reset", "icon sm"),
            "Start again",
          ),
        ),
      ),
      h(
        "section",
        { class: "card stack" },
        h("h3", null, "Your characters"),
        grid,
        h(
          "p",
          { class: "small muted" },
          "Green: 90% or better. Red: below 70%, practised more often.",
        ),
      ),
    ),
    exercise.el,
  );

  renderGrid();
  newRound();
  return {
    el,
    dispose: () => {
      exercise.dispose();
      stopTimer();
    },
  };
}
