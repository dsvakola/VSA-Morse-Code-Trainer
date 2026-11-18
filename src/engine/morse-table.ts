/**
 * VSA Morse Code Trainer — ITU-R M.1677 International Morse Character Set
 *
 * Full mapping for:
 * - 26 Letters (A–Z)
 * - 10 Numerals (0–9)
 * - 17 Punctuation & Symbols (. , ? ! ' / ( ) & : ; = + - _ " $ @)
 * - 7 Prosigns (<AR>, <SK>, <BT>, <AS>, <KN>, <SOS>, <HH>)
 */

export interface MorseCharacterDef {
  char: string;
  morse: string;
  name: string;
  category: "letter" | "digit" | "punctuation" | "prosign";
  /** Spoken vocal rhythm (e.g. 'di-dah' for A) */
  rhythm: string;
  /** Memory mnemonic / hook */
  hook?: string;
  /** Example word */
  exampleWord?: string;
}

export const ITU_MORSE_DEFS: MorseCharacterDef[] = [
  // Letters (A–Z)
  {
    char: "A",
    morse: ".-",
    name: "Alpha",
    category: "letter",
    rhythm: "di-dah",
    hook: "Hop then slide",
    exampleWord: "Apple",
  },
  {
    char: "B",
    morse: "-...",
    name: "Bravo",
    category: "letter",
    rhythm: "dah-di-di-dit",
    hook: "Slide then three drops",
    exampleWord: "Breeze",
  },
  {
    char: "C",
    morse: "-.-.",
    name: "Charlie",
    category: "letter",
    rhythm: "dah-di-dah-dit",
    hook: "Rock back and forth twice",
    exampleWord: "Cedar",
  },
  {
    char: "D",
    morse: "-..",
    name: "Delta",
    category: "letter",
    rhythm: "dah-di-dit",
    hook: "Long stride then two steps",
    exampleWord: "Dawn",
  },
  {
    char: "E",
    morse: ".",
    name: "Echo",
    category: "letter",
    rhythm: "dit",
    hook: "Quickest single touch",
    exampleWord: "Earth",
  },
  {
    char: "F",
    morse: "..-.",
    name: "Foxtrot",
    category: "letter",
    rhythm: "di-di-dah-dit",
    hook: "Two taps, long leap, one tap",
    exampleWord: "Flame",
  },
  {
    char: "G",
    morse: "--.",
    name: "Golf",
    category: "letter",
    rhythm: "dah-dah-dit",
    hook: "Two long slides and a drop",
    exampleWord: "Grand",
  },
  {
    char: "H",
    morse: "....",
    name: "Hotel",
    category: "letter",
    rhythm: "di-di-di-dit",
    hook: "Four fingers drumming swiftly",
    exampleWord: "Hope",
  },
  {
    char: "I",
    morse: "..",
    name: "India",
    category: "letter",
    rhythm: "di-dit",
    hook: "Two quick footsteps",
    exampleWord: "Iris",
  },
  {
    char: "J",
    morse: ".---",
    name: "Juliett",
    category: "letter",
    rhythm: "di-dah-dah-dah",
    hook: "One tap then three long waves",
    exampleWord: "Jade",
  },
  {
    char: "K",
    morse: "-.-",
    name: "Kilo",
    category: "letter",
    rhythm: "dah-di-dah",
    hook: "Sandwich: dash, dot, dash",
    exampleWord: "Keen",
  },
  {
    char: "L",
    morse: ".-..",
    name: "Lima",
    category: "letter",
    rhythm: "di-dah-di-dit",
    hook: "Step up, long slide, two taps",
    exampleWord: "Light",
  },
  {
    char: "M",
    morse: "--",
    name: "Mike",
    category: "letter",
    rhythm: "dah-dah",
    hook: "Two slow, deliberate sighs",
    exampleWord: "Moon",
  },
  {
    char: "N",
    morse: "-.",
    name: "November",
    category: "letter",
    rhythm: "dah-dit",
    hook: "Slide then hop (opposite of A)",
    exampleWord: "Night",
  },
  {
    char: "O",
    morse: "---",
    name: "Oscar",
    category: "letter",
    rhythm: "dah-dah-dah",
    hook: "Church bell tolling three times",
    exampleWord: "Ocean",
  },
  {
    char: "P",
    morse: ".--.",
    name: "Papa",
    category: "letter",
    rhythm: "di-dah-dah-dit",
    hook: "Dot bookends around two dashes",
    exampleWord: "Pearl",
  },
  {
    char: "Q",
    morse: "--.-",
    name: "Quebec",
    category: "letter",
    rhythm: "dah-dah-di-dah",
    hook: "Long, long, short, long call",
    exampleWord: "Quiet",
  },
  {
    char: "R",
    morse: ".-.",
    name: "Romeo",
    category: "letter",
    rhythm: "di-dah-dit",
    hook: "Hop, slide, hop — symmetric river",
    exampleWord: "River",
  },
  {
    char: "S",
    morse: "...",
    name: "Sierra",
    category: "letter",
    rhythm: "di-di-dit",
    hook: "Three quick knocks on the door",
    exampleWord: "Star",
  },
  {
    char: "T",
    morse: "-",
    name: "Tango",
    category: "letter",
    rhythm: "dah",
    hook: "One deep, sustained note",
    exampleWord: "Time",
  },
  {
    char: "U",
    morse: "..-",
    name: "Uniform",
    category: "letter",
    rhythm: "di-di-dah",
    hook: "Two steps running to a jump",
    exampleWord: "Unity",
  },
  {
    char: "V",
    morse: "...-",
    name: "Victor",
    category: "letter",
    rhythm: "di-di-di-dah",
    hook: "Beethoven's Fifth opening knock",
    exampleWord: "Valor",
  },
  {
    char: "W",
    morse: ".--",
    name: "Whiskey",
    category: "letter",
    rhythm: "di-dah-dah",
    hook: "Short hop into two rolling waves",
    exampleWord: "Wave",
  },
  {
    char: "X",
    morse: "-..-",
    name: "X-ray",
    category: "letter",
    rhythm: "dah-di-di-dah",
    hook: "Dashes framing two center dots",
    exampleWord: "Xenon",
  },
  {
    char: "Y",
    morse: "-.--",
    name: "Yankee",
    category: "letter",
    rhythm: "dah-di-dah-dah",
    hook: "Slide, hop, two sweeping slides",
    exampleWord: "Yield",
  },
  {
    char: "Z",
    morse: "--..",
    name: "Zulu",
    category: "letter",
    rhythm: "dah-dah-di-dit",
    hook: "Two long glides, two quick steps",
    exampleWord: "Zenith",
  },

  // Digits (0–9)
  {
    char: "0",
    morse: "-----",
    name: "Zero",
    category: "digit",
    rhythm: "dah-dah-dah-dah-dah",
    hook: "Five long heavy pillars",
  },
  {
    char: "1",
    morse: ".----",
    name: "One",
    category: "digit",
    rhythm: "di-dah-dah-dah-dah",
    hook: "One dot leading four dashes",
  },
  {
    char: "2",
    morse: "..---",
    name: "Two",
    category: "digit",
    rhythm: "di-di-dah-dah-dah",
    hook: "Two dots leading three dashes",
  },
  {
    char: "3",
    morse: "...--",
    name: "Three",
    category: "digit",
    rhythm: "di-di-di-dah-dah",
    hook: "Three dots leading two dashes",
  },
  {
    char: "4",
    morse: "....-",
    name: "Four",
    category: "digit",
    rhythm: "di-di-di-di-dah",
    hook: "Four dots climbing to one dash",
  },
  {
    char: "5",
    morse: ".....",
    name: "Five",
    category: "digit",
    rhythm: "di-di-di-di-dit",
    hook: "Five swift taps — the rapid hand",
  },
  {
    char: "6",
    morse: "-....",
    name: "Six",
    category: "digit",
    rhythm: "dah-di-di-di-dit",
    hook: "One dash followed by four dots",
  },
  {
    char: "7",
    morse: "--...",
    name: "Seven",
    category: "digit",
    rhythm: "dah-dah-di-di-dit",
    hook: "Two dashes followed by three dots",
  },
  {
    char: "8",
    morse: "---..",
    name: "Eight",
    category: "digit",
    rhythm: "dah-dah-dah-di-dit",
    hook: "Three dashes followed by two dots",
  },
  {
    char: "9",
    morse: "----.",
    name: "Nine",
    category: "digit",
    rhythm: "dah-dah-dah-dah-dit",
    hook: "Four dashes ending with one dot",
  },

  // Punctuation & Symbols
  {
    char: ".",
    morse: ".-.-.-",
    name: "Full Stop / Period",
    category: "punctuation",
    rhythm: "di-dah-di-dah-di-dah",
  },
  {
    char: ",",
    morse: "--..--",
    name: "Comma",
    category: "punctuation",
    rhythm: "dah-dah-di-di-dah-dah",
  },
  {
    char: "?",
    morse: "..--..",
    name: "Question Mark",
    category: "punctuation",
    rhythm: "di-di-dah-dah-di-dit",
  },
  {
    char: "!",
    morse: "-.-.--",
    name: "Exclamation Mark",
    category: "punctuation",
    rhythm: "dah-di-dah-di-dah-dah",
  },
  {
    char: "'",
    morse: ".----.",
    name: "Apostrophe",
    category: "punctuation",
    rhythm: "di-dah-dah-dah-dah-dit",
  },
  {
    char: "/",
    morse: "-..-.",
    name: "Slash / Fraction Bar",
    category: "punctuation",
    rhythm: "dah-di-di-dah-dit",
  },
  {
    char: "(",
    morse: "-.--.",
    name: "Open Parenthesis",
    category: "punctuation",
    rhythm: "dah-di-dah-dah-dit",
  },
  {
    char: ")",
    morse: "-.--.-",
    name: "Close Parenthesis",
    category: "punctuation",
    rhythm: "dah-di-dah-dah-di-dah",
  },
  {
    char: "&",
    morse: ".-...",
    name: "Ampersand",
    category: "punctuation",
    rhythm: "di-dah-di-di-dit",
  },
  {
    char: ":",
    morse: "---...",
    name: "Colon",
    category: "punctuation",
    rhythm: "dah-dah-dah-di-di-dit",
  },
  {
    char: ";",
    morse: "-.-.-.",
    name: "Semicolon",
    category: "punctuation",
    rhythm: "dah-di-dah-di-dah-dit",
  },
  {
    char: "=",
    morse: "-...-",
    name: "Equal Sign",
    category: "punctuation",
    rhythm: "dah-di-di-di-dah",
  },
  {
    char: "+",
    morse: ".-.-.",
    name: "Plus Sign",
    category: "punctuation",
    rhythm: "di-dah-di-dah-dit",
  },
  {
    char: "-",
    morse: "-....-",
    name: "Hyphen / Minus",
    category: "punctuation",
    rhythm: "dah-di-di-di-di-dah",
  },
  {
    char: "_",
    morse: "..--.-",
    name: "Underscore",
    category: "punctuation",
    rhythm: "di-di-dah-dah-di-dah",
  },
  {
    char: '"',
    morse: ".-..-.",
    name: "Quotation Mark",
    category: "punctuation",
    rhythm: "di-dah-di-di-dah-dit",
  },
  {
    char: "$",
    morse: "...-..-",
    name: "Dollar Sign",
    category: "punctuation",
    rhythm: "di-di-di-dah-di-di-dah",
  },
  {
    char: "@",
    morse: ".--.-.",
    name: "At Sign",
    category: "punctuation",
    rhythm: "di-dah-dah-di-dah-dit",
  },

  // Prosigns (transmitted run-together as a single unbroken character)
  {
    char: "<AR>",
    morse: ".-.-.",
    name: "End of Transmission",
    category: "prosign",
    rhythm: "di-dah-di-dah-dit",
    hook: "Sent as run-together AR; indicates message conclusion",
  },
  {
    char: "<SK>",
    morse: "...-.-",
    name: "End of Contact",
    category: "prosign",
    rhythm: "di-di-di-dah-di-dah",
    hook: "Silent Key: final sign-off between stations",
  },
  {
    char: "<BT>",
    morse: "-...-",
    name: "Break / Paragraph",
    category: "prosign",
    rhythm: "dah-di-di-di-dah",
    hook: "Separator between message header and text",
  },
  {
    char: "<AS>",
    morse: ".-...",
    name: "Wait / Stand By",
    category: "prosign",
    rhythm: "di-dah-di-di-dit",
    hook: "Asks receiving station to stand by briefly",
  },
  {
    char: "<KN>",
    morse: "-.--.",
    name: "Go Ahead (Named Station Only)",
    category: "prosign",
    rhythm: "dah-di-dah-dah-dit",
    hook: "Invites only the addressed station to transmit",
  },
  {
    char: "<SOS>",
    morse: "...---...",
    name: "Distress Call",
    category: "prosign",
    rhythm: "di-di-di-dah-dah-dah-di-di-dit",
    hook: "International maritime distress; sent as one continuous group",
  },
  {
    char: "<HH>",
    morse: "........",
    name: "Error / Correction",
    category: "prosign",
    rhythm: "di-di-di-di-di-di-di-dit",
    hook: "Eight continuous dots signalling transmission error",
  },
];

/** Fast text -> Morse lookup map */
export const TEXT_TO_MORSE_MAP = new Map<string, string>();

/** Fast Morse -> uppercase text/prosign lookup map */
export const MORSE_TO_TEXT_MAP = new Map<string, string>();

// Populate lookup maps:
// 1. Text to Morse
for (const item of ITU_MORSE_DEFS) {
  TEXT_TO_MORSE_MAP.set(item.char.toUpperCase(), item.morse);
}

// 2. Morse to Text.
// Letters, digits and punctuation take precedence. Several prosigns share their pattern with a
// punctuation mark (<AR> = "+", <BT> = "=", <AS> = "&", <KN> = "("), and a plain translator must
// round-trip ordinary text, so those patterns decode to the punctuation mark. Prosigns with a
// unique pattern (<SK>, <SOS>, <HH>) still decode to their prosign tag.
for (const item of ITU_MORSE_DEFS.filter((d) => d.category !== "prosign")) {
  if (!MORSE_TO_TEXT_MAP.has(item.morse)) {
    MORSE_TO_TEXT_MAP.set(item.morse, item.char);
  }
}
for (const item of ITU_MORSE_DEFS.filter((d) => d.category === "prosign")) {
  if (!MORSE_TO_TEXT_MAP.has(item.morse)) {
    MORSE_TO_TEXT_MAP.set(item.morse, item.char);
  }
}

/** Prosigns whose pattern is shared with a punctuation mark, e.g. ".-.-." -> "<AR>". */
export const MORSE_TO_PROSIGN_MAP = new Map<string, string>(
  ITU_MORSE_DEFS.filter((d) => d.category === "prosign").map((d) => [d.morse, d.char]),
);

/**
 * Normalizes input text dots and dashes into standard '.' and '-' characters.
 * Handles Unicode dot variants: · • ․ ⸱
 * Handles Unicode dash variants: – — − ‑ ‒
 */
export function normalizeMorseGlyphs(input: string): string {
  return input.replace(/[·•․⸱]/g, ".").replace(/[–—−‑‒_]/g, "-");
}

/**
 * Checks whether a given character or prosign is supported in ITU Morse.
 */
export function isSupportedChar(char: string): boolean {
  return TEXT_TO_MORSE_MAP.has(char.toUpperCase());
}

/**
 * Checks whether a given Morse pattern corresponds to a valid ITU character.
 */
export function isValidMorsePattern(pattern: string): boolean {
  return MORSE_TO_TEXT_MAP.has(pattern);
}
