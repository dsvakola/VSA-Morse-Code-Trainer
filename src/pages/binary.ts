/**
 * Binary Translator — text to 8-bit binary (UTF-8) and back.
 */

import { chooseSavePath, errorText, exportText, isDesktop } from "../api";
import { h, replace, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";

type Sep = " " | "" | "\n";

export function textToBinary(text: string, sep: Sep = " "): string {
  return Array.from(new TextEncoder().encode(text), (b) => b.toString(2).padStart(8, "0")).join(
    sep,
  );
}

/** Reads groups of 8 bits; anything other than 0 and 1 is ignored. Returns null for an incomplete byte. */
export function binaryToText(binary: string): { text: string; leftover: number } {
  const bits = binary.replace(/[^01]/g, "");
  const whole = bits.length - (bits.length % 8);
  const bytes = new Uint8Array(whole / 8);
  for (let i = 0; i < whole; i += 8) bytes[i / 8] = parseInt(bits.slice(i, i + 8), 2);
  return {
    text: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
    leftover: bits.length % 8,
  };
}

export default function binaryPage(): Page {
  let toBinary = true;
  let sep: Sep = " ";
  const input = h("textarea", {
    rows: 5,
    spellcheck: "false",
    "aria-label": "Input",
  }) as HTMLTextAreaElement;
  input.value = "VSA Morse";
  const output = h("div", {
    class: "morse-text card mono",
    style: { minHeight: "110px", userSelect: "text", wordBreak: "break-all" },
    "aria-live": "polite",
  });
  const note = h("p", { class: "small muted" });
  const tabs = h("div", { class: "tabs", role: "tablist" });
  const sepRow = h("div", { class: "row" });

  const result = () => (toBinary ? textToBinary(input.value, sep) : binaryToText(input.value).text);

  const update = () => {
    output.textContent = result() || "—";
    if (toBinary) note.textContent = `${new TextEncoder().encode(input.value).length} bytes`;
    else {
      const left = binaryToText(input.value).leftover;
      note.textContent = left
        ? `${left} extra bit(s) at the end were ignored; each character needs 8.`
        : "";
    }
  };

  const render = () => {
    replace(
      tabs,
      h(
        "button",
        { class: `tab${toBinary ? " active" : ""}`, onclick: () => swap(true) },
        "Text → Binary",
      ),
      h(
        "button",
        { class: `tab${toBinary ? "" : " active"}`, onclick: () => swap(false) },
        "Binary → Text",
      ),
    );
    replace(
      sepRow,
      toBinary
        ? (
            [
              [" ", "Space between bytes"],
              ["", "No spaces"],
              ["\n", "One byte per line"],
            ] as const
          ).map(([v, label]) =>
            h(
              "label",
              { class: "check" },
              h("input", {
                type: "radio",
                name: "sep",
                checked: sep === v,
                onchange: () => ((sep = v), update()),
              }),
              label,
            ),
          )
        : null,
    );
    input.placeholder = toBinary ? "Type text…" : "Paste binary, e.g. 01001000 01101001";
    update();
  };

  const swap = (bin: boolean) => {
    if (bin === toBinary) return;
    const out = result();
    toBinary = bin;
    input.value = out;
    render();
  };

  input.addEventListener("input", update);

  const save = async () => {
    if (!isDesktop()) return toast("Saving files works in the desktop app.", "error");
    try {
      const path = await chooseSavePath(toBinary ? "binary.txt" : "text.txt", {
        name: "Text",
        extensions: ["txt"],
      });
      if (!path) return;
      await exportText(path, result());
      toast("Saved.");
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  const el = h(
    "div",
    { class: "page" },
    h(
      "div",
      { class: "stack" },
      h("h2", null, "Binary Translator"),
      h(
        "p",
        { class: "lead" },
        "Computers store each letter as eight bits, ones and zeros, much as Morse stores it as dits and dahs. Convert text to binary and back.",
      ),
    ),
    tabs,
    h("section", { class: "card stack" }, input, sepRow),
    output,
    note,
    h(
      "div",
      { class: "row" },
      h(
        "button",
        {
          class: "btn",
          onclick: () => navigator.clipboard.writeText(result()).then(() => toast("Copied.")),
        },
        icon("copy", "icon sm"),
        "Copy",
      ),
      h(
        "button",
        { class: "btn ebony", onclick: () => void save() },
        icon("download", "icon sm"),
        "Save as .txt…",
      ),
      h(
        "button",
        { class: "btn ghost", onclick: () => ((input.value = ""), update()) },
        icon("trash", "icon sm"),
        "Clear",
      ),
    ),
    h(
      "section",
      { class: "card" },
      h("h3", null, "Morse and binary"),
      h(
        "p",
        null,
        "Both are two-symbol codes. Morse uses short and long marks with gaps of different lengths, so common letters can be short (E is a single dit). Binary uses a fixed 8 bits for every character, which is simpler for machines but longer for people.",
      ),
      h(
        "table",
        null,
        h("tr", null, h("th", null, "Letter"), h("th", null, "Morse"), h("th", null, "Binary")),
        ["E", "T", "S", "O"].map((c) =>
          h(
            "tr",
            null,
            h("td", { class: "mono" }, c),
            h("td", { class: "mono" }, { E: ".", T: "-", S: "...", O: "---" }[c] ?? ""),
            h("td", { class: "mono" }, textToBinary(c)),
          ),
        ),
      ),
    ),
  );
  render();
  return { el };
}
