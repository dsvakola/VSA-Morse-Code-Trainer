/**
 * Fundamentals — the ten-chapter course with interactive demos and chapter quizzes.
 */

import { FUNDAMENTAL_CHAPTERS, type Chapter, type Callout } from "../content/fundamentals/chapters";
import { getProgress, startPracticeTimer, updateProgress } from "../state/progress";
import { h, replace, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { farnsworthDemo, parisDemo, timelineDemo } from "../ui/demos";

const CALLOUT_LABEL: Record<Callout["type"], string> = {
  tip: "Practice tip",
  historical: "From history",
  warning: "Take care",
  quote: "Quotation",
};

function calloutBox(c: Callout): HTMLElement {
  return h(
    "div",
    {
      class: "card",
      style: { borderLeft: "5px solid var(--brass-500)", background: "var(--paper-100)" },
    },
    h("span", { class: "plaque" }, CALLOUT_LABEL[c.type]),
    h("p", { style: { fontStyle: c.type === "quote" ? "italic" : "normal" } }, c.text),
    c.author ? h("p", { class: "small muted" }, `— ${c.author}`) : null,
  );
}

export default function fundamentalsPage(): Page {
  const stopTimer = startPracticeTimer();
  let index = 0;
  const list = h("div", { class: "stack" });
  const reader = h("article", { class: "stack", style: { flex: "1", minWidth: "0" } });
  const progressLine = h("p", { class: "small muted" });

  const isDone = (c: Chapter) => getProgress().fundamentalsCompleted.includes(c.id);
  const setDone = (c: Chapter, done: boolean) =>
    updateProgress((p) => {
      p.fundamentalsCompleted = p.fundamentalsCompleted.filter((id) => id !== c.id);
      if (done) p.fundamentalsCompleted.push(c.id);
    });

  const renderList = () => {
    const done = getProgress().fundamentalsCompleted.length;
    progressLine.textContent = `${done} of ${FUNDAMENTAL_CHAPTERS.length} chapters complete`;
    replace(
      list,
      FUNDAMENTAL_CHAPTERS.map((c, i) =>
        h(
          "button",
          {
            class: `tab${i === index ? " active" : ""}`,
            style: { textAlign: "left", display: "flex", gap: "8px" },
            onclick: () => show(i),
          },
          h("span", { class: "mono" }, isDone(c) ? "✓" : String(c.number).padStart(2, "0")),
          h("span", null, c.title),
        ),
      ),
    );
  };

  const show = (i: number) => {
    index = i;
    const c = FUNDAMENTAL_CHAPTERS[i];
    renderList();

    const answers = new Map<number, number>();
    const quizResult = h("div");
    const questions = c.reviewQuestions.map((q, qi) =>
      h(
        "fieldset",
        { class: "card", style: { border: "1px solid var(--paper-300)" } },
        h("legend", { class: "small muted" }, `Question ${qi + 1}`),
        h("p", null, h("strong", null, q.question)),
        h(
          "div",
          { class: "stack" },
          q.options.map((opt, oi) =>
            h(
              "label",
              { class: "check" },
              h("input", { type: "radio", name: `q${qi}`, onchange: () => answers.set(qi, oi) }),
              opt,
            ),
          ),
        ),
      ),
    );
    const check = () => {
      const correct = c.reviewQuestions.filter(
        (q, qi) => answers.get(qi) === q.correctIndex,
      ).length;
      const all = correct === c.reviewQuestions.length;
      replace(
        quizResult,
        h(
          "div",
          { class: `feedback ${all ? "ok" : "bad"}` },
          all
            ? `All ${correct} correct — chapter complete!`
            : `${correct} of ${c.reviewQuestions.length} correct. Read the notes below and try again.`,
        ),
        c.reviewQuestions.map((q, qi) =>
          h(
            "p",
            { class: "small" },
            `${answers.get(qi) === q.correctIndex ? "✓" : "✗"} ${q.explanation}`,
          ),
        ),
      );
      if (all) {
        setDone(c, true);
        renderList();
      }
    };

    replace(
      reader,
      h(
        "header",
        { class: "stack" },
        h("span", { class: "plaque" }, `Chapter ${c.number} · ${c.readingTimeMinutes} min read`),
        h("h2", null, c.title),
        h("p", { class: "lead" }, c.subtitle),
      ),
      c.sections.map((sec) =>
        h(
          "section",
          { class: "card" },
          h("h3", null, sec.title),
          sec.paragraphs.map((para) => h("p", null, para)),
          sec.callout ? calloutBox(sec.callout) : null,
          sec.interactiveDemo === "timeline" ? timelineDemo() : null,
          sec.interactiveDemo === "paris" ? parisDemo() : null,
          sec.interactiveDemo === "farnsworth" ? farnsworthDemo() : null,
        ),
      ),
      h(
        "section",
        { class: "card" },
        h("h3", null, "Key points"),
        h(
          "ul",
          null,
          c.keyTakeaways.map((k) => h("li", null, k)),
        ),
      ),
      c.reviewQuestions.length
        ? h(
            "section",
            { class: "stack" },
            h("h3", null, "Check your understanding"),
            questions,
            h(
              "div",
              { class: "row" },
              h(
                "button",
                { class: "btn", onclick: check },
                icon("check", "icon sm"),
                "Check answers",
              ),
            ),
            quizResult,
          )
        : null,
      h(
        "div",
        { class: "row spread" },
        h(
          "button",
          { class: "btn ghost", disabled: i === 0, onclick: () => show(i - 1) },
          icon("arrowLeft", "icon sm"),
          "Previous",
        ),
        h(
          "label",
          { class: "check" },
          h("input", {
            type: "checkbox",
            checked: isDone(c),
            onchange: (e: Event) => (
              setDone(c, (e.target as HTMLInputElement).checked),
              renderList()
            ),
          }),
          "Mark chapter as read",
        ),
        h(
          "button",
          {
            class: "btn",
            disabled: i === FUNDAMENTAL_CHAPTERS.length - 1,
            onclick: () => show(i + 1),
          },
          "Next chapter",
          icon("arrowRight", "icon sm"),
        ),
      ),
    );
    reader.closest(".content")?.scrollTo({ top: 0 });
  };

  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Fundamentals of Morse Code"),
      h(
        "p",
        { class: "lead" },
        "Ten short chapters by Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar.",
      ),
      progressLine,
    ),
    h(
      "div",
      { style: { display: "flex", gap: "20px", alignItems: "flex-start" } },
      h("nav", { style: { width: "250px", flex: "none", position: "sticky", top: "0" } }, list),
      reader,
    ),
  );
  show(0);
  return { el, dispose: stopTimer };
}
