/**
 * Listening Drills — random groups, common words, call-signs, numbers and a full radio contact.
 */

import { DEFAULT_KOCH_ORDER } from "../engine";
import { startPracticeTimer } from "../state/progress";
import { getSettings, updateSettings } from "../state/settings";
import { copyExercise } from "../ui/copy-exercise";
import { h, slider, type Page } from "../ui/dom";

type DrillId = "groups" | "words" | "calls" | "numbers" | "qso";

const WORDS = [
  "THE",
  "AND",
  "FOR",
  "ARE",
  "BUT",
  "NOT",
  "YOU",
  "ALL",
  "ANY",
  "CAN",
  "HAD",
  "HER",
  "WAS",
  "ONE",
  "OUR",
  "OUT",
  "DAY",
  "GET",
  "HAS",
  "HIM",
  "HIS",
  "HOW",
  "MAN",
  "NEW",
  "NOW",
  "OLD",
  "SEE",
  "TWO",
  "WAY",
  "WHO",
  "RIG",
  "ANT",
  "NAME",
  "GOOD",
  "FINE",
  "CALL",
  "WORK",
  "HOME",
  "RADIO",
  "SIGNAL",
  "COPY",
  "POWER",
  "WATTS",
  "SUNNY",
  "RAIN",
  "TNX",
  "FB",
  "OM",
  "YL",
  "WX",
  "HR",
  "UR",
  "ES",
  "GM",
  "GA",
  "GE",
  "73",
  "88",
  "CQ",
  "DE",
  "QTH",
  "QRZ",
  "RST",
];

const PREFIXES = [
  "VE3",
  "I2",
  "W1",
  "K6",
  "N4",
  "G4",
  "DL1",
  "JA1",
  "VK2",
  "ZL1",
  "F5",
  "EA3",
  "OH2",
  "PY2",
  "4X1",
  "9V1",
];
const NAMES = ["JOHN", "JANE", "MIKE", "ANNA", "TOM", "MARY", "PETER", "LISA", "PAUL", "KATE"];
const CITIES = [
  "LONDON",
  "NEW YORK",
  "TORONTO",
  "BERLIN",
  "TOKYO",
  "SYDNEY",
  "DUBLIN",
  "MADRID",
  "BOSTON",
  "OSLO",
];

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const letters = (n: number) =>
  Array.from({ length: n }, () => pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""))).join("");

function callSign(): string {
  return `${pick(PREFIXES)}${letters(2 + Math.floor(Math.random() * 2))}`;
}

function makeDrill(id: DrillId, size: number): string {
  switch (id) {
    case "groups":
      return Array.from({ length: size }, () =>
        Array.from({ length: 5 }, () => pick(DEFAULT_KOCH_ORDER)).join(""),
      ).join(" ");
    case "words":
      return Array.from({ length: size }, () => pick(WORDS)).join(" ");
    case "calls":
      return Array.from({ length: Math.max(2, Math.ceil(size / 2)) }, callSign).join(" ");
    case "numbers":
      return Array.from({ length: size }, () =>
        String(Math.floor(Math.random() * 100000)).padStart(5, "0"),
      ).join(" ");
    case "qso": {
      const a = callSign();
      const b = callSign();
      const rst = `5${pick(["5", "7", "8", "9"])}9`;
      return `CQ CQ DE ${a} K ${a} DE ${b} GM UR RST ${rst} NAME ${pick(NAMES)} QTH ${pick(CITIES)} HW? ${a} DE ${b} K`;
    }
  }
}

const DRILLS: Array<{ id: DrillId; title: string; text: string }> = [
  {
    id: "groups",
    title: "Five-letter groups",
    text: "Random letters and digits in groups of five, as in a classic Morse test.",
  },
  {
    id: "words",
    title: "Common words",
    text: "Everyday English words and the abbreviations heard on the air.",
  },
  { id: "calls", title: "Call-signs", text: "Amateur radio call-signs from around the world." },
  {
    id: "numbers",
    title: "Numbers",
    text: "Groups of five digits. Numbers are the hardest to guess, so copy every one.",
  },
  { id: "qso", title: "Radio contact", text: "A short, realistic exchange between two stations." },
];

export default function drillsPage(): Page {
  const stopTimer = startPracticeTimer();
  let drill: DrillId = "groups";
  let size = 5;
  const tabs = h("div", { class: "tabs", role: "tablist" });
  const about = h("p", { class: "small muted" });

  const exercise = copyExercise({ recordStats: true, onNext: () => next() });
  const next = () => exercise.load(makeDrill(drill, size));

  const renderTabs = () => {
    tabs.replaceChildren(
      ...DRILLS.map((d) =>
        h(
          "button",
          {
            class: `tab${d.id === drill ? " active" : ""}`,
            role: "tab",
            "aria-selected": String(d.id === drill),
            onclick: () => ((drill = d.id), renderTabs(), next()),
          },
          d.title,
        ),
      ),
    );
    about.textContent = DRILLS.find((d) => d.id === drill)?.text ?? "";
  };

  const s = getSettings();
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Listening Drills"),
      h(
        "p",
        { class: "lead" },
        "Once you know the characters, build speed and confidence with real material. Turn up the background noise in the panel below for a real on-air feel.",
      ),
    ),
    tabs,
    about,
    h(
      "section",
      { class: "card grid three" },
      slider({
        label: "Items per drill",
        min: 3,
        max: 12,
        value: size,
        onInput: (v) => ((size = v), next()),
      }),
      slider({
        label: "Character speed",
        min: 5,
        max: 50,
        value: s.charSpeedWpm,
        unit: " WPM",
        onInput: (v) =>
          updateSettings({
            charSpeedWpm: v,
            effectiveSpeedWpm: Math.min(getSettings().effectiveSpeedWpm, v),
          }),
      }),
      slider({
        label: "Background noise",
        min: 0,
        max: 100,
        value: s.noiseLevel,
        unit: "%",
        onInput: (v) => updateSettings({ noiseLevel: v }),
      }),
    ),
    exercise.el,
  );

  renderTabs();
  next();
  return {
    el,
    dispose: () => {
      exercise.dispose();
      stopTimer();
    },
  };
}
