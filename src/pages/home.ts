/**
 * Home — welcome, today's practice, progress, and the rooms of the station.
 */

import { DEFAULT_KOCH_ORDER } from "../engine";
import { navigate } from "../router";
import { getProgress, minutesToday, streakDays } from "../state/progress";
import { getSettings } from "../state/settings";
import { h, type Page } from "../ui/dom";
import { icon, type IconName } from "../ui/icons";
import { telegraphKey } from "../ui/telegraph-key";
import { playText } from "../ui/morse";
import { FUNDAMENTAL_CHAPTERS } from "../content/fundamentals/chapters";
import { LESSONS } from "../content/lessons";

const ROOMS: Array<{ path: string; icon: IconName; title: string; text: string }> = [
  {
    path: "/lessons",
    icon: "path",
    title: "Guided Lessons",
    text: "Step-by-step lessons from your first two letters to whole sentences.",
  },
  {
    path: "/koch",
    icon: "ear",
    title: "Koch Ear Trainer",
    text: "Learn each character by its sound at full speed, unlocking a new one at 90%.",
  },
  {
    path: "/keyer",
    icon: "key",
    title: "Sending Key",
    text: "Send with the keyboard as a straight key or paddle and get your timing scored.",
  },
  {
    path: "/drills",
    icon: "radio",
    title: "Listening Drills",
    text: "Copy groups, words, call-signs, numbers and short radio exchanges.",
  },
  {
    path: "/quiz",
    icon: "check",
    title: "Quizzes & Certificate",
    text: "Eight levels from four letters to the full alphabet, then print your certificate.",
  },
  {
    path: "/fundamentals",
    icon: "scroll",
    title: "Fundamentals",
    text: "The 1-3-7 rule, the word PARIS, Farnsworth spacing and telegraph history.",
  },
  {
    path: "/reference",
    icon: "book",
    title: "Reference Library",
    text: "Every letter, number, sign, prosign and Q-code with its sound.",
  },
  {
    path: "/translator",
    icon: "swap",
    title: "Translator",
    text: "Text to Morse and back with sound, signal lamp, screen flash and WAV export.",
  },
];

export default function homePage(): Page {
  const s = getSettings();
  const p = getProgress();
  const key = telegraphKey("hero-key");

  const curriculumPct = Math.round(
    ((p.fundamentalsCompleted.length + p.lessonsCompleted.length + (p.kochUnlocked - 2)) /
      (FUNDAMENTAL_CHAPTERS.length + LESSONS.length + DEFAULT_KOCH_ORDER.length - 2)) *
      100,
  );
  const minutes = minutesToday(p);
  const goalPct = Math.min(100, Math.round((minutes / s.dailyGoalMinutes) * 100));

  const tapKey = async () => {
    key.setPressed(true);
    await playText("VSA", { noise: false, onEventStart: (ev) => key.setPressed(ev.type === "on") });
    key.setPressed(false);
  };
  key.el.addEventListener("click", () => void tapKey());
  key.el.style.cursor = "pointer";
  key.el.setAttribute("title", "Click the key to hear V S A in Morse");

  const stat = (value: string, label: string) =>
    h("div", { class: "stat" }, h("b", null, value), h("span", null, label));

  const el = h(
    "div",
    { class: "page" },
    h(
      "section",
      { class: "hero" },
      h(
        "div",
        { class: "stack" },
        h("span", { class: "plaque" }, "The Telegraph Office"),
        h("h2", null, "Learn Morse Code — by ear, by key, by heart"),
        h(
          "p",
          null,
          "Start with no knowledge at all and finish able to copy Morse by ear and send it cleanly with a key.",
        ),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            { class: "btn big", onclick: () => navigate("/lessons") },
            icon("path"),
            "Start the lessons",
          ),
          h(
            "button",
            { class: "btn big ebony", onclick: () => navigate("/koch") },
            icon("ear"),
            "Koch ear trainer",
          ),
        ),
      ),
      key.el,
    ),
    h(
      "div",
      { class: "grid four" },
      h(
        "div",
        { class: "card" },
        stat(`${minutes} / ${s.dailyGoalMinutes} min`, "Practice today"),
        h("div", { class: "meter" }, h("span", { style: { width: `${goalPct}%` } })),
      ),
      h(
        "div",
        { class: "card" },
        stat(`${streakDays(p)}`, "Day streak"),
        h("p", { class: "small muted" }, "Practise at least one minute a day."),
      ),
      h(
        "div",
        { class: "card" },
        stat(`${p.kochUnlocked} / ${DEFAULT_KOCH_ORDER.length}`, "Characters learnt"),
        h("p", { class: "small muted" }, "Koch characters unlocked."),
      ),
      h(
        "div",
        { class: "card" },
        stat(`${curriculumPct}%`, "Course progress"),
        h("div", { class: "meter" }, h("span", { style: { width: `${curriculumPct}%` } })),
      ),
    ),
    h("h3", null, "Rooms of the station"),
    h(
      "div",
      { class: "grid four" },
      ROOMS.map((r) =>
        h(
          "button",
          { class: "card char-tile", onclick: () => navigate(r.path) },
          h("div", { class: "card-title" }, icon(r.icon, "icon lg"), h("strong", null, r.title)),
          h("p", { class: "small muted" }, r.text),
        ),
      ),
    ),
    h("p", { class: "small muted" }, "Tip: click the brass key above to hear it send V S A."),
  );

  return { el };
}
