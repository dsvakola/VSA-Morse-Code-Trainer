/**
 * Teacher's Desk — a simple class roster kept on this computer, CSV export, and printable
 * practice sheets with an answer key.
 */

import { chooseSavePath, errorText, exportText, isDesktop, loadDoc, saveDoc } from "../api";
import { DEFAULT_KOCH_ORDER } from "../engine";
import { h, replace, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

export interface Student {
  id: string;
  name: string;
  group: string;
  quizLevel: number;
  kochChars: number;
  wpm: number;
  notes: string;
  updated: string;
}

interface Roster {
  students: Student[];
}

const csvCell = (v: string | number) => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function rosterCsv(students: Student[]): string {
  const head = [
    "Name",
    "Class",
    "Quiz level",
    "Koch characters",
    "Speed (WPM)",
    "Notes",
    "Updated",
  ];
  const rows = students.map((s) =>
    [s.name, s.group, s.quizLevel, s.kochChars, s.wpm, s.notes, s.updated].map(csvCell).join(","),
  );
  return [head.join(","), ...rows].join("\r\n");
}

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export default function teacherPage(): Page {
  let roster: Roster = { students: [] };
  let filter = "";
  const tableHost = h("div");
  const sheetHost = h("div");

  const save = () => saveDoc("roster", roster).catch((e) => toast(errorText(e), "error"));

  const field = (s: Student, key: keyof Student, type: "text" | "number", label: string) => {
    const input = h("input", {
      type,
      value: String(s[key]),
      "aria-label": `${label} for ${s.name || "student"}`,
      min: type === "number" ? 0 : undefined,
      class: type === "number" ? "narrow" : undefined,
    }) as HTMLInputElement;
    input.addEventListener("change", () => {
      (s as unknown as Record<string, string | number>)[key] =
        type === "number" ? Math.max(0, Number(input.value) || 0) : input.value.trim();
      s.updated = new Date().toISOString().slice(0, 10);
      void save();
    });
    return input;
  };

  const renderTable = () => {
    const shown = roster.students.filter(
      (s) => !filter || `${s.name} ${s.group}`.toLowerCase().includes(filter),
    );
    replace(
      tableHost,
      roster.students.length === 0
        ? h("p", { class: "muted" }, "No students yet. Add your first student above.")
        : h(
            "table",
            null,
            h(
              "tr",
              null,
              ["Name", "Class", "Quiz level", "Koch chars", "WPM", "Notes", ""].map((t) =>
                h("th", null, t),
              ),
            ),
            shown.map((s) =>
              h(
                "tr",
                null,
                h("td", null, field(s, "name", "text", "Name")),
                h("td", null, field(s, "group", "text", "Class")),
                h("td", null, field(s, "quizLevel", "number", "Quiz level")),
                h("td", null, field(s, "kochChars", "number", "Koch characters")),
                h("td", null, field(s, "wpm", "number", "Speed")),
                h("td", null, field(s, "notes", "text", "Notes")),
                h(
                  "td",
                  null,
                  h(
                    "button",
                    {
                      class: "btn ghost danger",
                      "aria-label": `Remove ${s.name}`,
                      onclick: () => {
                        if (!window.confirm(`Remove ${s.name || "this student"} from the roster?`))
                          return;
                        roster.students = roster.students.filter((x) => x.id !== s.id);
                        void save();
                        renderTable();
                      },
                    },
                    icon("trash", "icon sm"),
                  ),
                ),
              ),
            ),
          ),
    );
  };

  const nameIn = h("input", {
    type: "text",
    placeholder: "Student name, e.g. John Doe",
    "aria-label": "Student name",
  }) as HTMLInputElement;
  const groupIn = h("input", {
    type: "text",
    placeholder: "Class or batch",
    "aria-label": "Class",
  }) as HTMLInputElement;
  const add = () => {
    const name = nameIn.value.trim();
    if (!name) return toast("Please type the student's name.", "error");
    roster.students.push({
      id: newId(),
      name,
      group: groupIn.value.trim(),
      quizLevel: 0,
      kochChars: 2,
      wpm: 0,
      notes: "",
      updated: new Date().toISOString().slice(0, 10),
    });
    roster.students.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
    nameIn.value = "";
    nameIn.focus();
    void save();
    renderTable();
  };
  nameIn.addEventListener("keydown", (e) => e.key === "Enter" && add());

  const exportCsv = async () => {
    if (!isDesktop()) return toast("Exporting works in the desktop app.", "error");
    try {
      const path = await chooseSavePath("class-roster.csv", {
        name: "CSV spreadsheet",
        extensions: ["csv"],
      });
      if (!path) return;
      await exportText(path, "﻿" + rosterCsv(roster.students));
      toast("Roster exported.");
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  // ---------- printable practice sheet ----------
  const charsIn = h("input", {
    type: "number",
    min: 2,
    max: 36,
    value: 10,
    class: "narrow",
    "aria-label": "Koch characters",
  }) as HTMLInputElement;
  const makeSheet = () => {
    const n = Math.max(2, Math.min(36, Number(charsIn.value) || 10));
    const set = DEFAULT_KOCH_ORDER.slice(0, n);
    const lines = Array.from({ length: 10 }, () =>
      Array.from({ length: 5 }, () =>
        Array.from({ length: 5 }, () => set[Math.floor(Math.random() * set.length)]).join(""),
      ).join("  "),
    );
    replace(
      sheetHost,
      h(
        "div",
        { class: "row no-print" },
        h(
          "button",
          { class: "btn", onclick: () => window.print() },
          icon("print", "icon sm"),
          "Print sheet",
        ),
      ),
      h(
        "section",
        { class: "card print-sheet" },
        h("h3", null, "Morse copy practice"),
        h(
          "p",
          { class: "small" },
          `Characters: ${set.join(" ")}    Name: ____________________    Date: ___________`,
        ),
        h(
          "ol",
          { class: "sheet-lines" },
          lines.map(() => h("li", null, "_____  _____  _____  _____  _____")),
        ),
        h("h3", { class: "answer-key" }, "Answer key (teacher)"),
        h(
          "ol",
          { class: "sheet-lines mono" },
          lines.map((l) => h("li", null, l)),
        ),
      ),
    );
  };

  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack no-print" },
      h("h2", null, "Teacher's Desk"),
      h(
        "p",
        { class: "lead" },
        "Keep a simple record of your class, export it as a spreadsheet, and print copy-practice sheets with an answer key. Everything stays on this computer.",
      ),
    ),
    h(
      "section",
      { class: "card stack no-print" },
      h("h3", null, "Class roster"),
      h(
        "div",
        { class: "row" },
        nameIn,
        groupIn,
        h("button", { class: "btn", onclick: add }, icon("plus", "icon sm"), "Add student"),
        h("input", {
          type: "search",
          placeholder: "Search…",
          "aria-label": "Search roster",
          oninput: (e: Event) => (
            (filter = (e.target as HTMLInputElement).value.toLowerCase()),
            renderTable()
          ),
        }),
        h(
          "button",
          { class: "btn ebony", onclick: () => void exportCsv() },
          icon("download", "icon sm"),
          "Export CSV…",
        ),
      ),
      tableHost,
    ),
    h(
      "section",
      { class: "card stack no-print" },
      h("h3", null, "Practice sheet"),
      h(
        "div",
        { class: "row" },
        h("label", { class: "field" }, "Koch characters to use", charsIn),
        h("button", { class: "btn", onclick: makeSheet }, "Make a sheet"),
      ),
    ),
    sheetHost,
  );

  loadDoc<Roster>("roster")
    .then((r) => {
      if (r && Array.isArray(r.students)) roster = r;
      renderTable();
    })
    .catch((e) => {
      toast(errorText(e), "error");
      renderTable();
    });
  return { el };
}
