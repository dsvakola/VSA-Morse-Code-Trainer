/**
 * Quizzes & Certificate — eight levels from 4 letters up to the full alphabet A–Z.
 * Each quiz has 15 questions in three styles: listen and type, read a pattern, pick a pattern.
 * Passing a level (80%) opens the next one; a printable certificate records the result.
 */

import { getProgress, recordAnswer, startPracticeTimer, updateProgress } from "../state/progress";
import { h, replace, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { morseGlyph, patternOf, playText, signalLamp, stopPlayback } from "../ui/morse";
import { telegraphKey } from "../ui/telegraph-key";

/** Letters from the simplest sounds to the most complex. */
const ORDER = "ETIANMSOURWDKGHVFLPJBXCYZQ".split("");
const LEVEL_SIZES = [4, 7, 10, 13, 16, 19, 22, 26];
const QUESTIONS = 15;
const PASS_PCT = 80;

type Style = "listen" | "read" | "pick";

interface Question {
  style: Style;
  answer: string;
  options: string[];
}

const lettersFor = (level: number) => ORDER.slice(0, LEVEL_SIZES[level - 1]);
const shuffle = <T>(list: T[]): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function makeQuiz(level: number): Question[] {
  const set = lettersFor(level);
  const styles: Style[] = ["listen", "read", "pick"];
  return Array.from({ length: QUESTIONS }, (_, i) => {
    const answer = set[Math.floor(Math.random() * set.length)];
    const others = shuffle(set.filter((c) => c !== answer)).slice(0, 3);
    return { style: styles[i % 3], answer, options: shuffle([answer, ...others]) };
  });
}

export default function quizPage(): Page {
  const stopTimer = startPracticeTimer();
  const body = h("div", { class: "page" });
  const lamp = signalLamp();
  let questions: Question[] = [];
  let index = 0;
  let score = 0;
  let level = 1;
  let answered = false;

  const highestOpen = () => Math.min(LEVEL_SIZES.length, getProgress().bestQuizLevel + 1);

  const showLevels = () => {
    stopPlayback(lamp);
    const p = getProgress();
    const nameInput = h("input", {
      type: "text",
      value: p.operatorName,
      maxlength: 60,
      placeholder: "Your name, e.g. John Doe",
      "aria-label": "Your name",
    }) as HTMLInputElement;
    nameInput.addEventListener("change", () =>
      updateProgress((q) => (q.operatorName = nameInput.value.trim())),
    );
    replace(
      body,
      h(
        "div",
        { class: "stack" },
        h("h2", null, "Quizzes & Certificate"),
        h(
          "p",
          { class: "lead" },
          `Eight levels, from four letters to the full alphabet. Each quiz has ${QUESTIONS} questions; score ${PASS_PCT}% to open the next level and earn a certificate.`,
        ),
        h(
          "label",
          { class: "field", style: { maxWidth: "420px" } },
          "Name on certificates",
          nameInput,
        ),
      ),
      h(
        "div",
        { class: "grid four" },
        LEVEL_SIZES.map((size, i) => {
          const n = i + 1;
          const open = n <= highestOpen();
          const passed = n <= p.bestQuizLevel;
          const set = lettersFor(n);
          return h(
            "button",
            {
              class: `card lesson-card${open ? "" : " locked"}`,
              disabled: !open,
              onclick: () => start(n),
            },
            h(
              "div",
              { class: "row" },
              h("span", { class: "plaque" }, `Level ${n}`),
              passed ? h("span", { class: "chip ok" }, "Passed") : null,
            ),
            h("h3", null, n === LEVEL_SIZES.length ? "Full alphabet A–Z" : `${size} letters`),
            h("p", { class: "mono small" }, set.join(" ")),
          );
        }),
      ),
      p.quizHistory.length
        ? h(
            "section",
            { class: "card" },
            h("h3", null, "Recent results"),
            h(
              "table",
              null,
              h(
                "tr",
                null,
                h("th", null, "Date"),
                h("th", null, "Level"),
                h("th", null, "Score"),
                h("th", null, ""),
              ),
              [...p.quizHistory]
                .reverse()
                .slice(0, 10)
                .map((r) =>
                  h(
                    "tr",
                    null,
                    h("td", null, new Date(r.date).toLocaleString()),
                    h("td", null, `Level ${r.level}`),
                    h("td", null, `${r.score} / ${r.total}`),
                    h(
                      "td",
                      null,
                      Math.round((r.score / r.total) * 100) >= PASS_PCT
                        ? h(
                            "button",
                            {
                              class: "btn ghost",
                              onclick: () => showCertificate(r.level, r.score, r.total, r.date),
                            },
                            icon("print", "icon sm"),
                            "Certificate",
                          )
                        : null,
                    ),
                  ),
                ),
            ),
          )
        : null,
    );
  };

  const start = (n: number) => {
    level = n;
    questions = makeQuiz(n);
    index = 0;
    score = 0;
    showQuestion();
  };

  const showQuestion = () => {
    answered = false;
    const q = questions[index];
    const feedback = h("div", { "aria-live": "polite" });
    const nextBtn = h(
      "button",
      {
        class: "btn big hidden",
        onclick: () => (++index < questions.length ? showQuestion() : finish()),
      },
      index + 1 < questions.length ? "Next question" : "See my result",
      icon("arrowRight", "icon sm"),
    );

    const mark = (given: string) => {
      if (answered) return;
      answered = true;
      const ok = given.toUpperCase() === q.answer;
      if (ok) score++;
      recordAnswer(q.answer, ok);
      replace(
        feedback,
        h(
          "div",
          { class: `feedback ${ok ? "ok" : "bad"}` },
          ok ? "Correct!" : `Not quite. It was ${q.answer}.`,
          " ",
          morseGlyph(patternOf(q.answer)),
        ),
      );
      nextBtn.classList.remove("hidden");
      nextBtn.focus();
    };

    let task: HTMLElement;
    if (q.style === "listen") {
      const box = h("input", {
        type: "text",
        maxlength: 1,
        class: "mono answer-box",
        "aria-label": "Letter you heard",
        autocomplete: "off",
      }) as HTMLInputElement;
      box.addEventListener("input", () => box.value && mark(box.value));
      task = h(
        "div",
        { class: "stack" },
        h("p", null, "Listen, then type the letter you heard."),
        h(
          "div",
          { class: "row" },
          lamp.el,
          h(
            "button",
            {
              class: "btn",
              onclick: () =>
                void playText(q.answer, { lamp, noise: false }).then(() => box.focus()),
            },
            icon("play", "icon sm"),
            "Play again",
          ),
          box,
        ),
      );
      setTimeout(
        () => void playText(q.answer, { lamp, noise: false }).then(() => box.focus()),
        250,
      );
    } else if (q.style === "read") {
      task = h(
        "div",
        { class: "stack" },
        h("p", null, "Which letter is this?"),
        h("div", { class: "quiz-pattern" }, morseGlyph(patternOf(q.answer), true)),
        h(
          "div",
          { class: "row" },
          q.options.map((o) =>
            h("button", { class: "btn ebony big mono", onclick: () => mark(o) }, o),
          ),
        ),
      );
    } else {
      task = h(
        "div",
        { class: "stack" },
        h(
          "p",
          null,
          h("span", null, "Which pattern is the letter "),
          h("b", { class: "mono", style: { fontSize: "1.6rem" } }, q.answer),
          "?",
        ),
        h(
          "div",
          { class: "grid two" },
          q.options.map((o) =>
            h(
              "button",
              {
                class: "btn ghost big",
                "aria-label": `Pattern ${patternOf(o)}`,
                onclick: () => mark(o),
              },
              morseGlyph(patternOf(o), true),
            ),
          ),
        ),
      );
    }

    replace(
      body,
      h(
        "div",
        { class: "row" },
        h(
          "button",
          { class: "btn ghost", onclick: showLevels },
          icon("arrowLeft", "icon sm"),
          "Levels",
        ),
        h("span", { class: "plaque" }, `Level ${level}`),
        h(
          "span",
          { class: "small muted" },
          `Question ${index + 1} of ${questions.length} · Score ${score}`,
        ),
      ),
      h(
        "div",
        { class: "meter" },
        h("span", { style: { width: `${(index / questions.length) * 100}%` } }),
      ),
      h("section", { class: "card stack" }, task, feedback, nextBtn),
    );
  };

  const finish = () => {
    stopPlayback(lamp);
    const date = new Date().toISOString();
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= PASS_PCT;
    updateProgress((p) => {
      p.quizHistory.push({ date, level, score, total: questions.length });
      if (p.quizHistory.length > 200) p.quizHistory.splice(0, p.quizHistory.length - 200);
      if (passed && level > p.bestQuizLevel) p.bestQuizLevel = level;
    });
    if (passed && level < LEVEL_SIZES.length) toast(`Level ${level + 1} is now open.`);
    replace(
      body,
      h(
        "section",
        { class: "hero" },
        h(
          "div",
          { class: "stack" },
          h("span", { class: "plaque" }, `Level ${level} result`),
          h("h2", null, `${score} of ${questions.length} (${pct}%)`),
          h(
            "p",
            null,
            passed
              ? "Passed! Well done, operator."
              : `You need ${PASS_PCT}% to pass. Practise the letters you missed and try again.`,
          ),
          h(
            "div",
            { class: "row" },
            passed
              ? h(
                  "button",
                  {
                    class: "btn big",
                    onclick: () => showCertificate(level, score, questions.length, date),
                  },
                  icon("print", "icon sm"),
                  "View certificate",
                )
              : null,
            h(
              "button",
              { class: "btn ebony big", onclick: () => start(level) },
              icon("repeat", "icon sm"),
              "Try again",
            ),
            h("button", { class: "btn big", onclick: showLevels }, "All levels"),
          ),
        ),
        telegraphKey("hero-key").el,
      ),
    );
  };

  const showCertificate = (lvl: number, sc: number, total: number, date: string) => {
    const name = getProgress().operatorName || "Morse Code Student";
    const set = lettersFor(lvl);
    replace(
      body,
      h(
        "div",
        { class: "row no-print" },
        h(
          "button",
          { class: "btn ghost", onclick: showLevels },
          icon("arrowLeft", "icon sm"),
          "Levels",
        ),
        h(
          "button",
          { class: "btn", onclick: () => window.print() },
          icon("print", "icon sm"),
          "Print or save as PDF",
        ),
      ),
      h(
        "section",
        { class: "certificate" },
        telegraphKey("cert-key").el,
        h("p", { class: "cert-kicker" }, "VSA Morse Code Trainer"),
        h("h2", null, "Certificate of Achievement"),
        h("p", null, "This is to certify that"),
        h("p", { class: "cert-name" }, name),
        h(
          "p",
          null,
          `has passed Level ${lvl} of the Morse code quiz (${lvl === LEVEL_SIZES.length ? "the full alphabet A–Z" : `${set.length} letters: ${set.join(" ")}`}),`,
        ),
        h(
          "p",
          null,
          `scoring ${sc} out of ${total} (${Math.round((sc / total) * 100)}%) on ${new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}.`,
        ),
        h(
          "p",
          { class: "cert-morse mono" },
          "-.-. --- -. --. .-. .- - ..- .-.. .- - .. --- -. ...",
        ),
        h("p", { class: "small" }, "vsa.edu.in/software"),
      ),
    );
  };

  showLevels();
  return {
    el: body,
    dispose: () => {
      stopPlayback(lamp);
      stopTimer();
    },
  };
}
