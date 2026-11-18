/**
 * Help — how to use each room, keyboard shortcuts and common questions.
 */

import { navigate, ROUTES } from "../router";
import { h, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

const ROOM_HELP: Record<string, string> = {
  "/fundamentals":
    "Read the short chapters on how Morse works: timing, the PARIS standard, Farnsworth spacing and how to learn. Each ends with a small review.",
  "/lessons":
    "Follow the lessons in order. Listen to the new characters, then copy a round. Pass a round to open the next lesson.",
  "/reference":
    "Look up any letter, digit, punctuation mark, prosign, Q-code or abbreviation. Click a card to hear it. The Chart tab prints a wall chart.",
  "/koch":
    "The fastest proven way to learn by ear. Copy rounds of random groups; a new character unlocks when you reach the mark.",
  "/drills":
    "Practise on real material: groups, words, call-signs, numbers and a radio contact, with optional background noise.",
  "/keyer":
    "Send Morse with the keyboard, mouse or paddles and get a score for accuracy and rhythm.",
  "/quiz": "Eight levels from four letters to A–Z. Pass a level to earn a printable certificate.",
  "/translator":
    "Turn text into Morse or Morse into text. Play it, flash it on the screen, or save it as a WAV sound file.",
  "/decoder": "Open a WAV recording of Morse and read the message.",
  "/binary": "Convert text to 8-bit binary and back.",
  "/teacher": "Keep a class roster, export it as CSV, and print practice sheets.",
  "/settings":
    "Change pitch, volume, speed, noise, the sending key and goals. Back up and restore all your data.",
};

const FAQ: Array<[string, string]> = [
  [
    "I hear no sound.",
    "Check the Volume slider in Settings and your computer's volume. Sound starts after your first click in the window.",
  ],
  [
    "Should I count dits and dahs?",
    "No. Learn each character as one sound. Counting slows you down later. That is why the Koch trainer starts at full character speed.",
  ],
  [
    "What speed should I use?",
    "A character speed of 20 WPM with a Farnsworth speed of 10 WPM is a good start. Raise the Farnsworth speed as you improve.",
  ],
  [
    "Where is my progress kept?",
    "Only on this computer, in the app's own data folder. Use Settings → Save a backup to copy it to another computer.",
  ],
  ["Does the app need the internet?", "No. It works fully offline and sends nothing anywhere."],
  [
    "The audio decoder gives wrong letters.",
    "Use a recording with one clear tone and little noise. Very uneven hand-sent Morse may need a cleaner recording.",
  ],
];

export default function helpPage(): Page {
  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Help"),
      h("p", { class: "lead" }, "A quick guide to every room of the station."),
    ),
    h(
      "div",
      { class: "grid two" },
      ROUTES.filter((r) => ROOM_HELP[r.path]).map((r) =>
        h(
          "button",
          { class: "card room-card", onclick: () => navigate(r.path) },
          h("div", { class: "row" }, icon(r.icon, "icon"), h("h3", null, r.title)),
          h("p", { class: "small" }, ROOM_HELP[r.path]),
        ),
      ),
    ),
    h(
      "section",
      { class: "card" },
      h("h3", null, "Keyboard"),
      h(
        "table",
        null,
        [
          ["Space (changeable)", "Straight key in the Sending Key room"],
          ["Left Ctrl or [", "Dit paddle (iambic mode)"],
          ["Right Ctrl or ]", "Dah paddle (iambic mode)"],
          ["Enter", "Check your copy, then go to the next round"],
          ["Shift + Enter", "New line in an answer box"],
        ].map(([k, v]) => h("tr", null, h("td", null, h("kbd", null, k)), h("td", null, v))),
      ),
    ),
    h(
      "section",
      { class: "card stack" },
      h("h3", null, "Common questions"),
      FAQ.map(([q, a]) => h("details", null, h("summary", null, q), h("p", null, a))),
    ),
  );
  return { el };
}
