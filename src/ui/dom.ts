/**
 * VSA Morse Code Trainer — tiny DOM helpers (no framework).
 */

type Child = Node | string | number | null | undefined | false;
type Attrs = Record<string, unknown>;

/**
 * Creates an element. Attributes starting with "on" become event listeners, `class` sets the
 * class name, `style` accepts an object, and boolean `true`/`false` toggle attributes.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs | null = null,
  ...children: Array<Child | Child[]>
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (key === "class") {
        el.className = String(value);
      } else if (key === "style" && typeof value === "object") {
        Object.assign(el.style, value);
      } else if (key === "html") {
        el.innerHTML = String(value);
      } else if (value === true) {
        el.setAttribute(key, "");
      } else if (key === "value" && "value" in el) {
        (el as HTMLInputElement).value = String(value);
      } else {
        el.setAttribute(key, String(value));
      }
    }
  }
  append(el, children);
  return el;
}

export function append(parent: Node, children: Array<Child | Child[]>): void {
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    parent.appendChild(typeof child === "object" ? child : document.createTextNode(String(child)));
  }
}

/** Parses a trusted, app-authored SVG string into an element. */
export function svg(markup: string, className = ""): SVGSVGElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = markup.trim();
  const el = tpl.content.firstElementChild as SVGSVGElement;
  if (className) el.setAttribute("class", className);
  return el;
}

/** Replaces all children of `el`. */
export function replace(el: Element, ...children: Array<Child | Child[]>): void {
  el.replaceChildren();
  append(el, children);
}

/** A page returns its root element and, optionally, a cleanup run when the user leaves it. */
export interface Page {
  el: HTMLElement;
  dispose?: () => void;
}

/** Shows a short message at the bottom of the window. */
export function toast(message: string, kind: "info" | "error" = "info"): void {
  const host = document.getElementById("toast-host") ?? document.body;
  const note = h("div", { class: `toast toast-${kind}`, role: "status" }, message);
  host.appendChild(note);
  setTimeout(() => note.classList.add("toast-out"), 3200);
  setTimeout(() => note.remove(), 3700);
}

/** Labelled range slider bound to a numeric value. */
export function slider(opts: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onInput: (v: number) => void;
}): HTMLElement {
  const out = h("output", { class: "slider-value" }, `${opts.value}${opts.unit ?? ""}`);
  const input = h("input", {
    type: "range",
    min: opts.min,
    max: opts.max,
    step: opts.step ?? 1,
    value: opts.value,
    "aria-label": opts.label,
  });
  input.addEventListener("input", () => {
    const v = Number(input.value);
    out.textContent = `${v}${opts.unit ?? ""}`;
    opts.onInput(v);
  });
  return h(
    "label",
    { class: "slider" },
    h("span", { class: "slider-label" }, opts.label),
    input,
    out,
  );
}

/** Escapes text for use inside HTML strings. */
export function esc(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
