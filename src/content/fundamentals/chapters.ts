/**
 * Historical Morse Fundamentals Course Curriculum
 * Authored for Vidyasagar Academy by Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar.
 *
 * Comprehensive 10-chapter educational sequence covering auditory Morse learning,
 * 1-3-7 timing rules, the PARIS standard, Farnsworth spacing, information theory,
 * telegraph etiquette, historical milestones, and safety notices.
 */

export interface Callout {
  type: "tip" | "historical" | "warning" | "quote";
  text: string;
  author?: string;
}

export interface ReviewQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChapterSection {
  title: string;
  paragraphs: string[];
  callout?: Callout;
  interactiveDemo?: "timeline" | "paris" | "farnsworth";
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  readingTimeMinutes: number;
  sections: ChapterSection[];
  keyTakeaways: string[];
  reviewQuestions: ReviewQuestion[];
}

export const FUNDAMENTAL_CHAPTERS: Chapter[] = [
  {
    id: "ch1-sound-beats-sight",
    number: 1,
    title: "Why Sound Beats Sight",
    subtitle: "The Psychology of Auditory Reflex vs. Visual Translation",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "The Visual Trap",
        paragraphs: [
          "When newcomers first encounter Morse code, they almost always begin by staring at a printed chart of dots and dashes. They visually memorize that the letter 'A' is represented by a dot followed by a dash (· —). While this visual mapping seems intuitive, it is the single most destructive habit a Morse student can develop.",
          "When you read Morse visually, your brain performs a cumbersome three-stage translation: first, the ear hears a sound; second, the brain translates the acoustic tone into mental dots and dashes; third, it looks up those dots and dashes on an imaginary printed chart to find the letter 'A'.",
          "At five words per minute (WPM), this mental translation feels manageable. But as transmission speed increases to twelve or fifteen WPM, conscious counting crashes. The human brain simply cannot count visual dots and dashes at high speed. You hit an insurmountable ceiling known among telegraphers as the 'Plateau of Despair'.",
        ],
        callout: {
          type: "quote",
          text: "Never think of dots and dashes. Think of sounds and rhythms. You do not read sheet music by counting vibration frequencies; you hear a song. Morse code is music.",
          author: "Early Commercial Telegraph Manual, 1915",
        },
      },
      {
        title: "Developing the Auditory Reflex",
        paragraphs: [
          "Master telegraphers do not hear dots and dashes. When they hear the sound 'di-DAH', they do not visualize '· —'; their fingers immediately strike the letter 'A' on a typewriter or write it in cursive without conscious intervention.",
          "This is known as the Auditory Motor Reflex. The acoustic sound must be linked directly to the alphanumeric symbol. Just as a child recognizes the spoken word 'CAT' without having to spell out C-A-T in their mind, an experienced CW operator perceives the acoustic melody of each letter as a unique, indivisible auditory shape.",
        ],
        callout: {
          type: "tip",
          text: "Always practice with your eyes closed or focused away from printed charts. Let your ear perceive the rhythmic melody of each character as a single acoustic word.",
        },
      },
      {
        title: "Singing Morse: Dits and Dahs",
        paragraphs: [
          "To train your vocal cords and auditory cortex in harmony, telegraphers never say 'dot' and 'dash'. 'Dot' ends in a hard, abrupt consonant (T), which destroys the musical flow of Morse. Instead, operators speak Morse using 'DIT' and 'DAH'.",
          "When a dit is followed immediately by another element within the same character, the terminal 'T' is dropped, softening it to 'DI'. Thus, the letter 'L' (· — · ·) is spoken as 'di-DAH-di-dit'. The letter 'B' (— · · ·) is vocalized as 'DAH-di-di-dit'. Singing these rhythms aloud creates powerful neurological links between speech, hearing, and muscle memory.",
        ],
      },
    ],
    keyTakeaways: [
      "Visual memorization of printed charts leads to a severe speed plateau at 10–12 WPM.",
      "Morse code is a musical language composed of acoustic rhythms, not visual symbols.",
      "Never say 'dot and dash'—always vocalize elements as 'dit' and 'dah' (e.g., 'di-DAH' for A).",
      "True proficiency is an automatic auditory reflex linking the sound directly to the letter.",
    ],
    reviewQuestions: [
      {
        question: "Why do telegraph instructors strongly discourage counting dots and dashes?",
        options: [
          "Because counting causes an insurmountable speed barrier when speeds exceed 10–12 WPM",
          "Because dots and dashes are only used for numerical digits",
          "Because telegraph paper was historically too expensive to write down dots",
          "Because Samuel Morse forbade visual charts in his original patent",
        ],
        correctIndex: 0,
        explanation:
          "Conscious counting takes too long. At operational speeds, only auditory reflex recognition allows the brain to keep up with incoming characters.",
      },
      {
        question: "How should the Morse character for the letter 'L' (· — · ·) be vocalized aloud?",
        options: ["Dot Dash Dot Dot", "di-DAH-di-dit", "DAH-di-DAH-dit", "Dit Dah Dah Dit"],
        correctIndex: 1,
        explanation:
          "Internal dits drop the hard 't' sound and become 'di', with the final dit sounding as 'dit'. Thus '· — · ·' is 'di-DAH-di-dit'.",
      },
    ],
  },
  {
    id: "ch2-dits-dahs-timing",
    number: 2,
    title: "Dits, Dahs & The 1-3-7 Rule",
    subtitle: "The Mathematical Architecture of International Morse",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "The Universal Building Block: The Element Unit",
        paragraphs: [
          "Every signal in Morse code—whether sent by brass hand-key, optical signal lamp, or radio carrier wave—is constructed from a single fundamental unit of time, conventionally denoted as 'T' or 1 Unit.",
          "All durations, silences, and spacing ratios in International Morse are exact integer multiples of this single unit. If your base unit is 60 milliseconds long, every single element in your message is strictly measured against that 60 ms benchmark.",
        ],
      },
      {
        title: "The Strict 1-3-7 Timing Ratio",
        paragraphs: [
          "To ensure global intelligibility across noisy radio bands and transatlantic cables, the International Telecommunication Union (ITU-R Recommendation M.1677) codifies four absolute timing laws:",
          "1. A DIT equals exactly 1 Unit in duration.\n2. A DAH equals exactly 3 Units (the duration of three dits).\n3. The silent space between elements within the same character is exactly 1 Unit.\n4. The silent space between consecutive characters within a word is exactly 3 Units.\n5. The silent space between words is exactly 7 Units.",
        ],
        interactiveDemo: "timeline",
        callout: {
          type: "tip",
          text: "Remember the 1 : 3 : 7 rule: 1 unit inside a character, 3 units between letters, 7 units between words. Rhythm and silence carry just as much meaning as the tones themselves.",
        },
      },
      {
        title: "The Importance of Silence",
        paragraphs: [
          "Novice telegraphers frequently obsess over making crisp tones, but they neglect the silences between them. In Morse code, silence is not empty void—it is the syntactic punctuation that separates meaning from chaos.",
          "Consider the difference between the word 'CAT' and the single letter 'F'. If you collapse the 3-unit inter-character spaces in 'CAT' (— · — · / · — / —), you produce an illegible stream of run-together dits and dahs that no human or machine can decipher.",
          "Clean spacing distinguishes a master operator from an amateur with an 'unruly fist'.",
        ],
      },
    ],
    keyTakeaways: [
      "The duration of one dit is the universal base unit (1T) of all Morse timing.",
      "One dah = 3 units; intra-character space = 1 unit; inter-character space = 3 units; inter-word space = 7 units.",
      "Silence is an active element of the code; without precise 3-unit and 7-unit spaces, letters merge into gibberish.",
    ],
    reviewQuestions: [
      {
        question:
          "If a dit lasts 50 milliseconds, how long must a silent inter-character space last?",
        options: ["50 ms (1 unit)", "100 ms (2 units)", "150 ms (3 units)", "350 ms (7 units)"],
        correctIndex: 2,
        explanation:
          "Inter-character spacing is always 3 units. At 50 ms per unit, 3 × 50 ms = 150 ms.",
      },
      {
        question: "How long is a silent space between two words under standard ITU timing?",
        options: ["3 units", "5 units", "7 units", "10 units"],
        correctIndex: 2,
        explanation: "The silent gap between words is standardized at exactly 7 units.",
      },
    ],
  },
  {
    id: "ch3-paris-speed-standard",
    number: 3,
    title: "The Standard Word 'PARIS'",
    subtitle: "How Speed in Words Per Minute is Scientifically Measured",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "Why an Arbitrary Word is Required",
        paragraphs: [
          "In English prose, words vary dramatically in length. The word 'A' takes only 5 units of transmission time, whereas the word 'HOMESICK' takes more than 70 units. If an operator claims to send '20 words per minute', what kind of words are they sending?",
          "To establish an objective, repeatable scientific benchmark, telegraph organizations in the early 20th century adopted a standardized calibration word. That universal word is 'PARIS'.",
        ],
      },
      {
        title: "The 50-Unit Anatomy of PARIS",
        paragraphs: [
          "The word 'PARIS' was deliberately selected because its combination of letters represents the average statistical distribution of characters in Western languages. When transmitted with correct ITU spacing, PARIS requires exactly 50 element units:",
          "• Letter P: . - - . = 1+1+3+1+3+1+1 = 11 units (+ 3 units letter space = 14 units)\n• Letter A: . - = 1+1+3 = 5 units (+ 3 units letter space = 8 units)\n• Letter R: . - . = 1+1+3+1+1 = 7 units (+ 3 units letter space = 10 units)\n• Letter I: . . = 1+1+1 = 3 units (+ 3 units letter space = 6 units)\n• Letter S: . . . = 1+1+1+1+1 = 5 units (+ 7 units word space = 12 units)\n\nGrand Total: 14 + 8 + 10 + 6 + 12 = 50 Units!",
        ],
        interactiveDemo: "paris",
        callout: {
          type: "tip",
          text: "Mathematical Formula: Unit duration (ms) = 1200 / WPM. At 20 WPM, 1 unit = 1200 / 20 = 60 ms. At 12 WPM, 1 unit = 1200 / 12 = 100 ms.",
        },
      },
      {
        title: "The Alternative 'CODEX' Standard",
        paragraphs: [
          "In military and encrypted diplomatic communications, messages consist of random 5-character cipher groups (e.g., 'XQJ7Z'). Because random groups contain significantly more dah-heavy letters and numbers than ordinary English, the word 'CODEX' is sometimes used as a 60-unit benchmark.",
          "However, for all civilian, international ham radio, and VSA Morse Code Trainer curriculum purposes, the 50-unit PARIS standard is the world reference.",
        ],
      },
    ],
    keyTakeaways: [
      "The word 'PARIS' followed by a word space contains exactly 50 standard element units.",
      "The universal conversion formula is: Unit length in milliseconds = 1200 / Speed in WPM.",
      "Sending 'PARIS' 20 times in one minute equals exactly 20 WPM (1,000 units per minute).",
    ],
    reviewQuestions: [
      {
        question:
          "How many total units does the standard word 'PARIS' (including its trailing word space) contain?",
        options: ["40 units", "50 units", "60 units", "100 units"],
        correctIndex: 1,
        explanation:
          "PARIS contains 50 units: P(11)+gap(3) + A(5)+gap(3) + R(7)+gap(3) + I(3)+gap(3) + S(5)+word gap(7) = 50.",
      },
      {
        question:
          "At a transmission speed of 15 WPM, what is the exact duration of a single dit unit?",
        options: ["60 ms", "80 ms", "100 ms", "120 ms"],
        correctIndex: 1,
        explanation: "Unit duration = 1200 / WPM. For 15 WPM: 1200 / 15 = 80 milliseconds.",
      },
    ],
  },
  {
    id: "ch4-farnsworth-spacing",
    number: 4,
    title: "Farnsworth Spacing",
    subtitle: "Full-Speed Character Melodies with Extended Thinking Gaps",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "The 10-WPM Wall and Donald Farnsworth",
        paragraphs: [
          "In the 1950s, a teacher named Donald R. Farnsworth analyzed why thousands of military and amateur radio students suffered a sudden, demoralizing failure when trying to advance past 10 words per minute.",
          "Traditional training methods started beginners at 5 WPM by stretching every single dit and dah into long, agonizing moans. At 5 WPM standard speed, a dit lasts 240 ms and a dah lasts nearly three-quarters of a second. At that sluggish speed, students comfortably count dots and dashes with their conscious minds.",
          "When the teacher accelerated the lessons to 13 WPM for license exams, the character melodies sounded completely unrecognizable! The students had never learned the true high-speed musical chords of the letters. They hit a brick wall.",
        ],
      },
      {
        title: "The Farnsworth Innovation",
        paragraphs: [
          "Farnsworth proposed a revolutionary training paradigm: never alter the internal speed of the characters. Always send individual letters at target operational speed (typically 18 to 20 WPM), but artificially lengthen the spaces between letters and words.",
          "Under Farnsworth timing, when you hear the letter 'Q' (— — · —), you hear it at a brisk 20 WPM: 'DAH-DAH-di-DAH' in less than a second. Your ear immediately captures its rhythmic signature. Then, a generous silent interval follows, giving your brain ample time to register the letter without panic.",
        ],
        interactiveDemo: "farnsworth",
        callout: {
          type: "tip",
          text: "As you become more proficient, the internal tone speed remains rock-solid at 20 WPM; you simply shorten the silent spaces between letters until you reach full continuous copy.",
        },
      },
      {
        title: "The Mathematical ARRL Farnsworth Formula",
        paragraphs: [
          "The American Radio Relay League (ARRL) formalized Farnsworth spacing mathematically. When character speed 'c' exceeds overall transmission speed 's', the additional delay added to every letter gap and word gap is calculated as:",
          "Delay = (60c - 37.2s) / (19 * c * s) seconds.\n\nThis guarantees that individual character shapes remain pristine while the overall text rate matches your current learning level.",
        ],
      },
    ],
    keyTakeaways: [
      "Traditional slow Morse trains students to consciously count dits and dahs, leading to the 10 WPM plateau.",
      "Farnsworth spacing plays characters at target speed (18–20 WPM) while stretching inter-character gaps.",
      "As proficiency grows, gap lengths shrink while the character melodies remain identical and familiar.",
    ],
    reviewQuestions: [
      {
        question: "What is the primary psychological advantage of Farnsworth spacing?",
        options: [
          "It forces the audio tone frequency to change pitch dynamically",
          "It trains the student's ear to recognize character melodies at full speed from day one",
          "It reduces the total number of characters in the alphabet",
          "It allows operators to skip punctuation entirely",
        ],
        correctIndex: 1,
        explanation:
          "By sending individual letters at 18–20 WPM, students learn the authentic rhythmic sound of each character without having to relearn them later.",
      },
      {
        question:
          "In a Farnsworth setup with 20 WPM character speed and 8 WPM overall speed, what changes?",
        options: [
          "The dits and dahs are stretched longer",
          "Only the silent pauses between letters and words are lengthened",
          "The pitch of the tone is lowered",
          "The transmission power is reduced",
        ],
        correctIndex: 1,
        explanation:
          "Farnsworth timing preserves crisp, fast dits and dahs; only the inter-character and inter-word pauses are stretched.",
      },
    ],
  },
  {
    id: "ch5-letter-frequency-vail",
    number: 5,
    title: "Letter Frequency & Alfred Vail",
    subtitle: "The Victorian Precursor to Data Compression and Information Theory",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "The Print Shop Discovery",
        paragraphs: [
          "Legend often credits Samuel F. B. Morse with every detail of the telegraph system, but the brilliant engineering of the Morse alphabet belongs largely to his partner and machinist, Alfred Vail.",
          "In the early 1840s at Speedwell Ironworks in Morristown, New Jersey, Vail realized that transmitting text over telegraph wires would be dreadfully slow if frequent letters took as long to send as rare ones.",
          "To optimize the code, Vail visited a local newspaper printing office. He examined the typesetter's cases—the wooden compartmentalized drawers where printers kept cast-metal type. He counted the number of lead letters the printer kept in stock for each drawer.",
        ],
        callout: {
          type: "historical",
          text: "Alfred Vail discovered that the English language uses the letter 'E' far more frequently than any other letter, followed closely by 'T', 'A', 'O', 'I', 'N', and 'S'.",
        },
      },
      {
        title: "Huffman Coding a Century Before Computers",
        paragraphs: [
          "Armed with empirical print shop statistics, Vail designed the code so that the most frequent letters received the shortest acoustic representations:",
          "• E (most frequent) = a single dit (·) [1 unit]\n• T (second most frequent) = a single dah (—) [3 units]\n• I = two dits (· ·) [3 units]\n• A = dit dah (· —) [5 units]\n• N = dah dit (— ·) [5 units]\n\nBy contrast, rare letters like Q (— — · —), Z (— — · ·), and J (· — — —) received longer, four-element patterns.",
          "Vail had independently invented variable-length entropy encoding—the exact mathematical principle David Huffman formalized in 1952 for digital data compression!",
        ],
      },
      {
        title: "Efficiency in High-Speed Telegraphy",
        paragraphs: [
          "Because of Vail's frequency mapping, an average English sentence can be tapped out in roughly half the time of an unoptimized code. For nineteenth-century telegraph companies, this efficiency meant doubling the capacity of expensive copper telegraph lines without laying a single extra strand of wire.",
        ],
      },
    ],
    keyTakeaways: [
      "Alfred Vail analyzed printer lead-type cases to determine letter frequencies in the English language.",
      "The most common letters received the shortest codes (E is 1 dit, T is 1 dah).",
      "Vail's insight anticipated modern digital data compression and variable-length encoding by over a century.",
    ],
    reviewQuestions: [
      {
        question:
          "How did Alfred Vail determine which letters should receive the shortest Morse patterns?",
        options: [
          "He consulted the Greek alphabet order",
          "He counted the quantity of lead type in a local newspaper printer's cases",
          "He conducted a random lottery at the patent office",
          "He timed how fast his apprentice could tap different letters",
        ],
        correctIndex: 1,
        explanation:
          "Vail visited a Morristown print shop and counted the metal types in the type cases to find empirical English letter frequencies.",
      },
      {
        question: "Which two letters have the absolute shortest Morse code representations?",
        options: ["A and N", "E and T", "S and O", "I and M"],
        correctIndex: 1,
        explanation: "E is a single dit (·, 1 unit) and T is a single dah (—, 3 units).",
      },
    ],
  },
  {
    id: "ch6-prosigns-and-punctuation",
    number: 6,
    title: "Prosigns & Telegram Punctuation",
    subtitle: "Procedural Signals, Run-Together Characters, and Punctuation Conventions",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "What is a Prosign?",
        paragraphs: [
          "In professional Morse communication, operators need a way to issue procedural instructions (such as 'end of message', 'wait', or 'station closing down') without spelling out lengthy sentences.",
          "These special instructions are called 'procedural signs', or simply PROSIGNS. Prosigns are written with an overline (or inside angle brackets, such as <AR> or <SK>) to indicate a critical technical rule: the two letters are sent run-together as a single, unbroken character, with NO inter-character space between them.",
        ],
        callout: {
          type: "tip",
          text: "When sending <AR>, do not send 'A' (pause) 'R'. Send dit-dah-dit-dah-dit (· — · — ·) as one continuous five-element acoustic melody!",
        },
      },
      {
        title: "The Essential Prosigns of International Morse",
        paragraphs: [
          "Every telegrapher and radio amateur must know these standard prosigns by heart:",
          "• <AR> (· — · — ·) : End of transmission / 'Over to you'.\n• <SK> (· · · — · —) : 'Silent Key' / Out / Closing station permanently.\n• <BT> (— · · · —) : Break / Separator between telegram header and body (equivalent to '=' or new paragraph).\n• <AS> (· — · · ·) : Wait / Stand by for a moment.\n• <KN> (— · — — ·) : Go ahead, specific addressed station ONLY.\n• <SOS> (· · · — — — · · ·) : Extreme international distress signal.\n• <HH> (· · · · · · · ·) : Error / 8 dits meaning 'Erase last word; correction follows'.",
        ],
      },
      {
        title: "Punctuation in the Telegram Era",
        paragraphs: [
          "In commercial telegraphy, every punctuation mark cost money to transmit. Telegraph operators frequently substituted standard abbreviations: a period was sent as the prosign or the spoken word 'STOP'.",
          "Standard International Morse includes precise 6-element codes for standard punctuation: Period (· — · — · —), Comma (— — · · — —), Question Mark (· · — — · ·), and Fraction Bar / Slash (— · · — ·).",
        ],
      },
    ],
    keyTakeaways: [
      "Prosigns are procedural signals formed by merging two characters without an inter-character gap.",
      "<AR> signifies end of transmission; <SK> signifies station signing off; <BT> is a paragraph break.",
      "<SOS> is transmitted as a single continuous 9-element rhythm, not three separate letters.",
      "The error prosign <HH> consists of eight rapid dits meaning 'disregard last word'.",
    ],
    reviewQuestions: [
      {
        question:
          "How is a prosign like <AR> transmitted differently from the separate letters 'A' and 'R'?",
        options: [
          "It is sent at a higher audio pitch",
          "It is transmitted with no silent pause between the letters, as one continuous sound",
          "It is repeated three times in succession",
          "It is sent only using optical flashlights",
        ],
        correctIndex: 1,
        explanation:
          "Prosigns are run together into a single acoustic glyph without the standard 3-unit inter-character gap.",
      },
      {
        question: "What does an operator mean when they tap eight consecutive dits (<HH>)?",
        options: [
          "Emergency, clear the frequency immediately",
          "Error in sending; disregard the previous word",
          "End of the working day",
          "Signal strength is maximum",
        ],
        correctIndex: 1,
        explanation:
          "<HH> (8 dits) is the universal Morse correction/error signal indicating the sender made a mistake and will re-send the word.",
      },
    ],
  },
  {
    id: "ch7-telegraph-etiquette-q-codes",
    number: 7,
    title: "Telegraph Etiquette & Q-Signals",
    subtitle: "Overcoming Language Barriers on the World's Airwaves",
    readingTimeMinutes: 6,
    sections: [
      {
        title: "The Invention of Q-Signals",
        paragraphs: [
          "In the early 1900s, as wireless telegraphy spread across maritime shipping lanes, shipboard radio operators faced a profound dilemma: a British radio officer, a French captain, and a Japanese deck watch could not understand one another's spoken languages.",
          "To create a universal lingua franca, the British Post Office in 1909 and the International Radiotelegraph Convention of London in 1912 codified the Q-Code—a standardized system of three-letter abbreviations all beginning with the letter 'Q'.",
        ],
      },
      {
        title: "Questions vs. Statements",
        paragraphs: [
          "Every Q-code has two meanings depending solely on whether it is followed by a Question Mark (· · — — · ·):",
          "• Without '?': It is an affirmative statement or direct instruction.\n• With '?': It is a question inquiring about conditions.",
          "For example: 'QTH London' means 'My location is London'. Sending 'QTH?' asks the other station 'What is your location?'.",
        ],
        callout: {
          type: "tip",
          text: "Never say 'My QTH is...'. Simply send 'QTH [Location]'. In Morse code, brevity is the soul of courtesy.",
        },
      },
      {
        title: "The Most Common Q-Codes Every Operator Must Know",
        paragraphs: [
          "• QTH: Location / Geographical position.\n• QRM: Man-made interference from adjacent stations on the band.\n• QRN: Atmospheric static, lightning noise, or cosmic background noise.\n• QRS: Send more slowly ('Please decrease your WPM').\n• QRQ: Send faster ('Please increase your WPM').\n• QSL: Acknowledge receipt ('I confirm I copied your message perfectly').\n• QSY: Change operating frequency ('Shift to another frequency').\n• QRZ: Who is calling me? ('Who is calling?').",
        ],
      },
      {
        title: "Telegrapher Camaraderie: 73 and 88",
        paragraphs: [
          "Telegraphers also developed historic numerical codes from the 1859 Western Union '92 Code'. The two most cherished numbers in radio history are:",
          "• 73: 'Best regards' — the universal friendly sign-off between telegraphers.\n• 88: 'Love and kisses' — reserved for affectionate sign-offs between partners.",
        ],
      },
    ],
    keyTakeaways: [
      "Q-codes are universal three-letter abbreviations enabling operators of different languages to communicate.",
      "Appending a question mark turns any Q-code statement into an inquiry (e.g., QTH = 'My location is'; QTH? = 'Where are you?').",
      "QRM means man-made interference; QRN means atmospheric static.",
      "'73' is the traditional telegraphic greeting meaning 'Best regards'.",
    ],
    reviewQuestions: [
      {
        question:
          "If an incoming signal is too fast for you to copy, what Q-code should you transmit?",
        options: ["QRQ", "QRS", "QTH", "QSL"],
        correctIndex: 1,
        explanation: "QRS means 'Send more slowly'. QRQ is the opposite ('Send faster').",
      },
      {
        question:
          "What is the historical meaning of sending the number '73' at the end of a contact?",
        options: [
          "Emergency, need immediate assistance",
          "Best regards",
          "Frequency is closing in 73 minutes",
          "Repeat last transmission 3 times",
        ],
        correctIndex: 1,
        explanation: "73 has meant 'Best regards' since the Western Union 92-code of 1859.",
      },
    ],
  },
  {
    id: "ch8-common-sending-mistakes",
    number: 8,
    title: "Common Sending Mistakes & Bad Habits",
    subtitle: "Diagnosing Collapsed Gaps, Banana Keying, and the Rushing Fist",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "The Anatomy of a 'Bad Fist'",
        paragraphs: [
          "In telegraph parlance, an operator's 'fist' is their personal rhythm, cadence, and touch on the key. In the 19th century, wire chiefs could identify individual operators across hundreds of miles solely by the rhythmic idiosyncrasies of their sending.",
          "However, when personal idiosyncrasies distort standard timing ratios, the sender develops what telegraphers lament as an 'unruly fist'. Bad sending habits formed during early training are notoriously difficult to unlearn.",
        ],
      },
      {
        title: "Mistake #1: Collapsed Inter-Character Gaps",
        paragraphs: [
          "The most epidemic mistake among beginners is failing to hold the key open for the required 3-unit space between letters. When you send 'TO' (— / — — —) but fail to pause for 3 units between the T and the O, the listener hears four consecutive dahs (— — — —).",
          "In Morse code, four continuous dahs is not recognized in International Morse, or might be mistaken for two 'M's. Always count the 3-unit silence deliberately in your mind.",
        ],
        callout: {
          type: "warning",
          text: "Never rush into the next letter. Give your listener the courtesy of clean, generous 3-unit breathing spaces between letters.",
        },
      },
      {
        title: "Mistake #2: 'Banana Keying' and Dot/Dash Ratio Distortion",
        paragraphs: [
          "The second common flaw is distorted element ratios. A dah must be exactly three times the duration of a dit. Nervous operators often shorten dahs until they sound like elongated dits (a 2:1 ratio), making letters like 'A' (· —) sound like 'I' (· ·).",
          "Alternatively, on iambic paddle keys, operators with uncalibrated contact spacing produce clipped, stuttering dits. Always practice with a sidetone monitor or visual oscilloscope to inspect your dits and dahs.",
        ],
      },
      {
        title: "Mistake #3: Rushing Before You Can Listen",
        paragraphs: [
          "A universal golden rule of Morse telegraphy is: 'Never send faster than you can comfortably copy with a pencil.'",
          "If you send a transmission at a blistering 22 WPM, the receiving operator will naturally assume you are an expert and will reply at 22 WPM! If your actual receiving capability is only 12 WPM, you will be utterly lost on their very first word. Send at the exact speed you desire to receive.",
        ],
      },
    ],
    keyTakeaways: [
      "An operator's personal sending style is historically called their 'fist'.",
      "Collapsed inter-character spaces fuse separate letters into unintelligible gibberish.",
      "A dah must always be precisely 3 units long; shortening it leads to severe copy confusion.",
      "Never send faster on the key than you can comfortably decode with your ears.",
    ],
    reviewQuestions: [
      {
        question:
          "What happens if a sender fails to leave a 3-unit space between the letters 'T' (—) and 'E' (·)?",
        options: [
          "The signal tone automatically drops in pitch",
          "The listener hears the single letter 'N' (— ·)",
          "The telegraph line shorts out",
          "The receiver's software pauses automatically",
        ],
        correctIndex: 1,
        explanation:
          "T (—) and E (·) run together without an inter-character gap form — ·, which is the letter N!",
      },
      {
        question: "Why should an operator never send at a speed higher than their copying ability?",
        options: [
          "The key contacts will wear out prematurely",
          "Because the responding station will reply at the same high speed, leaving the sender unable to copy",
          "Because radio waves cannot propagate faster than 15 WPM",
          "Because government licenses specify maximum sending speeds",
        ],
        correctIndex: 1,
        explanation:
          "In Morse etiquette, stations reply at the speed they are called. If you send at 20 WPM, expect a 20 WPM response.",
      },
    ],
  },
  {
    id: "ch9-historical-chronicle",
    number: 9,
    title: "Historical Chronicle",
    subtitle: "From Samuel Morse's 1844 Baltimore Line to the Titanic and Modern CW",
    readingTimeMinutes: 7,
    sections: [
      {
        title: "The Birth of Electric Telecommunication (1837–1844)",
        paragraphs: [
          "Before the electric telegraph, messages could travel no faster than a galloping horse or a puff of smoke from a mountaintop beacon. In 1832, while returning from Europe aboard the packet ship 'Sully', portrait painter and inventor Samuel Finley Breese Morse witnessed scientific demonstrations of the newly discovered electromagnet.",
          "Morse became obsessed with the vision of instantaneous electric communication. Partnering with mechanical genius Alfred Vail and science professor Leonard Gale, Morse secured a $30,000 grant from the United States Congress in 1843 to construct an experimental 44-mile line between Washington, D.C., and Baltimore, Maryland.",
          "On May 24, 1844, sitting in the Old Supreme Court Chamber in the U.S. Capitol, Morse tapped out the momentous historic telegram: 'WHAT HATH GOD WROUGHT' (Numbers 23:23). Seconds later, Alfred Vail received and confirmed the message at the Mount Clare railroad depot in Baltimore. The telecommunications era was born.",
        ],
        callout: {
          type: "historical",
          text: "The first message, 'WHAT HATH GOD WROUGHT', was suggested by Annie Ellsworth, daughter of the U.S. Patent Commissioner, who brought Morse the news that Congress had funded his telegraph line.",
        },
      },
      {
        title: "The Transatlantic Cables and Global Synchrony",
        paragraphs: [
          "By the 1850s, telegraph wires crisscrossed continents, but oceans remained impassable barriers. American entrepreneur Cyrus West Field and British physicist William Thomson (later Lord Kelvin) undertook the daring quest to lay heavy copper cable across the Atlantic Ocean seafloor.",
          "After multiple heartbreaking cable breaks in mid-ocean storms, Queen Victoria and President James Buchanan exchanged greetings via transatlantic telegraph cable on August 16, 1858. For the first time in human history, news that previously took two weeks by steamship crossed the Atlantic in minutes.",
        ],
      },
      {
        title: "The Titanic Tragedy and the Adoption of SOS (1912)",
        paragraphs: [
          "When Guglielmo Marconi introduced wireless spark-gap telegraphy to ocean liners in the early 1900s, British Marconi operators used the distress signal 'CQD' ('Seek You, Danger'). Meanwhile, the 1906 Berlin Radiotelegraphic Convention had established 'SOS' (· · · — — — · · ·) as the international standard distress call, chosen specifically because its rhythmic sequence of three dits, three dahs, and three dits was unmistakable amid heavy static.",
          "On the night of April 14, 1912, when the RMS Titanic struck an iceberg in the North Atlantic, senior wireless operator Jack Phillips and junior operator Harold Bride initially transmitted CQD. As the ship sank deeper, Bride famously quipped to Phillips: 'Send SOS; it's the new call, and it may be your last chance to send it.'",
          "Phillips transmitted both CQD and SOS until water flooded the wireless cabin. The distress calls summoned the RMS Carpathia, saving more than 700 lives and cementing SOS forever in world history.",
        ],
      },
      {
        title: "Morse Code Today: Continuous Wave (CW) in the 21st Century",
        paragraphs: [
          "Although commercial shipping transitioned to satellite-based GMDSS systems in 1999, Morse code is far from dead. Hundreds of thousands of licensed amateur radio operators worldwide practice 'CW' (Continuous Wave) daily.",
          "CW remains the most energy-efficient, narrow-bandwidth mode of electromagnetic communication on Earth. A 5-watt Morse signal occupying just 100 Hz of radio spectrum can bounce off the ionosphere and circle the globe, cutting through solar flares and emergency blackouts where modern voice and digital signals fail completely.",
        ],
      },
    ],
    keyTakeaways: [
      "On May 24, 1844, Samuel Morse transmitted 'WHAT HATH GOD WROUGHT' between Washington and Baltimore.",
      "The transatlantic telegraph cable (1858–1866) connected Old and New Worlds with near-instantaneous speed.",
      "The RMS Titanic disaster of 1912 accelerated the universal adoption of the distinct rhythmic SOS distress call.",
      "Continuous Wave (CW) Morse code remains the most resilient, spectrum-efficient radio communication mode known.",
    ],
    reviewQuestions: [
      {
        question:
          "What historic message did Samuel Morse transmit on May 24, 1844, from Washington to Baltimore?",
        options: [
          "WHAT HATH GOD WROUGHT",
          "COME HERE MR WATSON",
          "CQD CQD MGY",
          "GLORY TO GOD IN THE HIGHEST",
        ],
        correctIndex: 0,
        explanation:
          "'WHAT HATH GOD WROUGHT' (Numbers 23:23) was transmitted by Morse from the U.S. Capitol to Alfred Vail in Baltimore.",
      },
      {
        question:
          "Why was 'SOS' chosen over other letter combinations as the international distress signal?",
        options: [
          "Because it stands for 'Save Our Souls'",
          "Because its distinct rhythmic pattern (3 dits, 3 dahs, 3 dits) is unmistakable even in heavy radio static",
          "Because it was the initials of the inventor of the life raft",
          "Because it was the shortest 3-letter word in the English language",
        ],
        correctIndex: 1,
        explanation:
          "SOS does not stand for 'Save Our Souls'—it was chosen purely for its distinctive, unmissable auditory rhythm: · · · — — — · · ·.",
      },
    ],
  },
  {
    id: "ch10-emergency-safety-notice",
    number: 10,
    title: "Emergency Safety Notice & Practical CW",
    subtitle: "Educational Scope, Real-World Signaling, and Amateur Radio Pathways",
    readingTimeMinutes: 5,
    sections: [
      {
        title: "Educational and Recreational Scope",
        paragraphs: [
          "VSA Morse Code Trainer is designed solely as an educational, historical, and amateur radio training software platform. While the principles taught here are technically rigorous and comply with international ITU-R M.1677 standards, this software is not a certified safety-of-life or commercial maritime emergency device.",
          "Never rely solely on desktop software in place of official emergency distress beacons (such as EPIRBs, PLBs, or satellite transponders) when navigating at sea, venturing into the wilderness, or facing real-world perilous situations.",
        ],
        callout: {
          type: "warning",
          text: "In any life-threatening emergency, always contact primary emergency services (such as 112, 911, or 999) or activate certified 406 MHz satellite locator beacons.",
        },
      },
      {
        title: "Improvised Optical and Acoustic SOS in the Wild",
        paragraphs: [
          "Despite modern satellites, knowledge of basic Morse distress signaling has saved countless hikers, sailors, and mountaineers when battery-powered radios and phones failed.",
          "To signal SOS visually or acoustically in an emergency without a radio:",
          "• With a Flashlight or Mirror: Flash 3 short bursts, pause, 3 long sustained flashes, pause, 3 short bursts. Repeat after a several-second pause.\n• With a Whistle or Car Horn: Blast 3 short chirps, pause, 3 long blasts, pause, 3 short chirps.\n• Ground Markers: In remote areas, arrange three stones, logs, or fires in a line or triangle to alert search aircraft.",
        ],
      },
      {
        title: "Your Pathway to Amateur Radio (Ham Radio)",
        paragraphs: [
          "If you have enjoyed learning Morse code through this curriculum, the natural next step is obtaining an Amateur Radio license! Every country has its own licensing authority and examination, for example the FCC in the United States, Ofcom in the United Kingdom and ISED in Canada. Your national amateur radio society can tell you how to prepare.",
          "Amateur radio allows you to operate your own high-frequency transmitters, build antennas, participate in worldwide Morse contests, and provide vital emergency communications during cyclones, earthquakes, and flood disasters when cellular towers collapse.",
        ],
        callout: {
          type: "tip",
          text: "Look up your national amateur radio society (a member of the International Amateur Radio Union, IARU). Most run beginner classes, Morse practice nets and licence exam sessions.",
        },
      },
    ],
    keyTakeaways: [
      "VSA Morse Code Trainer is an educational platform adhering to ITU standards, but not a certified emergency beacon.",
      "Optical or whistle SOS (3 short, 3 long, 3 short) remains a vital universal emergency survival skill.",
      "Amateur radio licensing provides a fulfilling worldwide community for active Morse CW operators.",
    ],
    reviewQuestions: [
      {
        question:
          "How should an optical SOS distress signal be flashed with a mirror or flashlight?",
        options: [
          "One continuous flash until the battery dies",
          "3 short flashes, 3 long flashes, 3 short flashes, followed by a pause",
          "5 rapid flashes every 10 seconds",
          "Any random flashing pattern",
        ],
        correctIndex: 1,
        explanation:
          "The universal optical SOS is 3 short flashes (dits), 3 long flashes (dahs), and 3 short flashes (dits).",
      },
      {
        question: "What do you need before you may transmit on the amateur radio bands?",
        options: [
          "Nothing, the bands are open to everyone",
          "An amateur radio licence from your country's radio authority",
          "A commercial broadcasting permit",
          "Only a radio bought from a licensed shop",
        ],
        correctIndex: 1,
        explanation:
          "Each country issues amateur radio licences through its own radio authority, usually after a short examination.",
      },
    ],
  },
];
