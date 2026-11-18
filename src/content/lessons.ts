/**
 * Guided lessons: the Koch order in small steps, then punctuation, prosigns, words and sentences.
 */

import { DEFAULT_KOCH_ORDER } from "../engine";

export interface Lesson {
  number: number;
  title: string;
  /** Characters introduced in this lesson (may be empty for word / sentence lessons). */
  newChars: string[];
  /** Everything the exercise may ask about. */
  practiceSet: string[];
  /** For word and sentence lessons: the items to copy. */
  items?: string[];
  intro: string;
}

const STEP = [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; // 36 characters in pairs

function buildLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  let index = 0;
  for (const size of STEP) {
    const newChars = DEFAULT_KOCH_ORDER.slice(index, index + size);
    if (!newChars.length) break;
    index += size;
    const known = DEFAULT_KOCH_ORDER.slice(0, index);
    lessons.push({
      number: lessons.length + 1,
      title: `Learn ${newChars.join(" and ")}`,
      newChars: [...newChars],
      practiceSet: [...known],
      intro:
        lessons.length === 0
          ? "Every journey starts here. Listen to each sound several times. Do not count dits and dahs — learn each letter as one rhythm, like a short tune."
          : `Two new sounds today. They are mixed with the ${known.length - newChars.length} you already know.`,
    });
  }

  lessons.push({
    number: lessons.length + 1,
    title: "Punctuation . , ? /",
    newChars: [".", ",", "?", "/"],
    practiceSet: [".", ",", "?", "/", "=", ...DEFAULT_KOCH_ORDER.slice(0, 10)],
    intro:
      "The four marks you will meet most often on the air. The stroke / is common in call-signs like K1ABC/P.",
  });
  lessons.push({
    number: lessons.length + 1,
    title: "Prosigns AR, SK, BT, KN",
    newChars: ["<AR>", "<SK>", "<BT>", "<KN>"],
    practiceSet: ["<AR>", "<SK>", "<BT>", "<KN>"],
    intro:
      "Prosigns are sent as one run-together character. AR ends a message, SK ends a contact, BT separates parts, KN invites only the named station to reply.",
  });
  lessons.push({
    number: lessons.length + 1,
    title: "Common words",
    newChars: [],
    practiceSet: [],
    items: [
      "THE",
      "AND",
      "YOU",
      "NAME",
      "RIG",
      "ANT",
      "WX",
      "HR",
      "TNX",
      "FB",
      "OP",
      "QTH",
      "RST",
      "73",
      "CQ",
      "DE",
    ],
    intro:
      "Now hear whole words. Try to recognise each word as a single sound pattern instead of spelling it letter by letter.",
  });
  lessons.push({
    number: lessons.length + 1,
    title: "Short sentences",
    newChars: [],
    practiceSet: [],
    items: [
      "GM OM",
      "TNX FER CALL",
      "UR RST 599",
      "NAME IS JOHN",
      "QTH LONDON",
      "WX IS SUNNY",
      "73 ES GL",
      "CQ CQ DE K1ABC K",
    ],
    intro:
      "The final lesson: copy short sentences of the kind you will hear in a real radio contact.",
  });
  return lessons;
}

export const LESSONS: Lesson[] = buildLessons();
