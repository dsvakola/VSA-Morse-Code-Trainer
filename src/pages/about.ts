/**
 * About — developers, version (read from the Rust side), licence and acknowledgements.
 *
 * Only the Vidyasagar Academy website and e-mail open externally (the app's opener permission
 * allows nothing else); other resources are listed as plain addresses.
 */

import { appInfo, errorText, openExternal } from "../api";
import { h, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { telegraphKey } from "../ui/telegraph-key";

const RESOURCES = [
  [
    "Vidyasagar Academy Arduino Morse project",
    "vsa.edu.in/convert-text-into-morse-code-with-beeps-back-into-text-with-arduino/",
  ],
  ["ITU-R M.1677, the international Morse standard", "www.itu.int/rec/R-REC-M.1677/en"],
  ["ARRL, American Radio Relay League", "www.arrl.org"],
  ["CWops CW Academy", "cwops.org/cw-academy/"],
  ["LCWO, Learn CW Online", "lcwo.net"],
];

const LIBRARIES = [
  ["Tauri", "MIT / Apache-2.0"],
  ["serde, serde_json", "MIT / Apache-2.0"],
  ["Vite", "MIT"],
  ["TypeScript", "Apache-2.0"],
];

export default function aboutPage(): Page {
  const version = h("span", { class: "plaque" }, `Version ${__APP_VERSION__}`);
  appInfo()
    .then((info) => (version.textContent = `Version ${info.version}`))
    .catch(() => {
      /* keep the build-time version */
    });

  const open = (url: string) => openExternal(url).catch((e) => toast(errorText(e), "error"));
  const key = telegraphKey("hero-key");

  const el = h(
    "div",
    { class: "page" },
    h(
      "section",
      { class: "hero" },
      h(
        "div",
        { class: "stack" },
        h(
          "div",
          { class: "row" },
          h("img", {
            src: "/logo.png",
            alt: "Vidyasagar Academy logo",
            width: "72",
            height: "72",
            class: "about-logo",
          }),
          version,
        ),
        h("h2", null, "VSA Morse Code Trainer"),
        h(
          "p",
          null,
          "Developed by Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar, for Vidyasagar Academy.",
        ),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            { class: "btn", onclick: () => open("https://github.com/dsvakola/software") },
            icon("globe", "icon sm"),
            "More Software by VSA",
          ),
          h(
            "button",
            { class: "btn ebony", onclick: () => open("mailto:softinquiry@vsa.edu.in") },
            icon("mail", "icon sm"),
            "softinquiry@vsa.edu.in",
          ),
        ),
      ),
      key.el,
    ),
    h(
      "div",
      { class: "grid two" },
      h(
        "section",
        { class: "card" },
        h("h3", null, "Licence"),
        h(
          "p",
          null,
          "GNU General Public License v3.0 (GPL-3.0). You may share and change this program under the terms of that licence.",
        ),
        h(
          "p",
          { class: "small muted" },
          "Copyright © 2026 Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar, Vidyasagar Academy. This program comes with absolutely no warranty.",
        ),
      ),
      h(
        "section",
        { class: "card" },
        h("h3", null, "Privacy"),
        h(
          "p",
          null,
          "The app works fully offline, collects no personal data, sends nothing over the internet, and keeps all progress only on your computer.",
        ),
      ),
    ),
    h(
      "section",
      { class: "card" },
      h("h3", null, "Related resources"),
      h(
        "table",
        null,
        RESOURCES.map(([name, url]) =>
          h(
            "tr",
            null,
            h("td", null, name),
            h("td", { class: "mono small", style: { userSelect: "text" } }, url),
          ),
        ),
      ),
    ),
    h(
      "section",
      { class: "card" },
      h("h3", null, "Open-source libraries"),
      h(
        "table",
        null,
        LIBRARIES.map(([name, lic]) =>
          h("tr", null, h("td", null, name), h("td", { class: "small muted" }, lic)),
        ),
      ),
    ),
    h(
      "div",
      { class: "feedback bad" },
      "Safety note: SOS and distress signals in this app are for learning only. In a real emergency, always use official emergency services.",
    ),
  );
  return { el };
}
