/**
 * VSA Morse Code Trainer — application start-up and the station shell (sidebar + top bar).
 */

import "./styles/main.css";
import { audioPlayer } from "./audio/playback";
import { ROUTES, currentPath, type Route } from "./router";
import { getSettings, initSettings, subscribeSettings } from "./state/settings";
import {
  getProgress,
  initProgress,
  minutesToday,
  streakDays,
  subscribeProgress,
} from "./state/progress";
import { h, replace, type Page } from "./ui/dom";
import { icon } from "./ui/icons";
import { telegraphKey } from "./ui/telegraph-key";

const GROUPS: Array<{ id: Route["group"]; label: string }> = [
  { id: "learn", label: "Learn" },
  { id: "practice", label: "Practise" },
  { id: "tools", label: "Tools" },
  { id: "station", label: "Station" },
];

let activePage: Page | null = null;
let navToken = 0;

function buildSidebar(): HTMLElement {
  const nav = h("nav", { class: "nav", "aria-label": "Rooms" });
  for (const group of GROUPS) {
    nav.append(h("div", { class: "nav-group" }, group.label));
    for (const r of ROUTES.filter((x) => x.group === group.id)) {
      nav.append(
        h(
          "a",
          { class: "nav-link", href: `#${r.path}`, "data-path": r.path },
          icon(r.icon),
          h("span", null, r.title),
        ),
      );
    }
  }
  const art = telegraphKey("sidebar-key");
  return h(
    "aside",
    { class: "sidebar" },
    h(
      "div",
      { class: "nameplate" },
      art.el,
      h(
        "div",
        { class: "nameplate-text" },
        h("strong", null, "VSA Morse"),
        h("span", null, "Code Trainer"),
      ),
    ),
    nav,
    h("div", { class: "sidebar-foot" }, `Version ${__APP_VERSION__}`),
  );
}

function buildTopBar(): { el: HTMLElement; setTitle: (t: string) => void } {
  const title = h("h1", { class: "topbar-title" });
  const speed = h("span", { class: "gauge", title: "Character speed / Farnsworth speed" });
  const streak = h("span", {
    class: "gauge",
    title: "Days in a row with at least one minute of practice",
  });
  const today = h("span", { class: "gauge", title: "Practice time today against your daily goal" });

  const refresh = () => {
    const s = getSettings();
    const p = getProgress();
    replace(speed, icon("clock", "icon sm"), `${s.charSpeedWpm} / ${s.effectiveSpeedWpm} WPM`);
    replace(streak, icon("flame", "icon sm"), `${streakDays(p)} day streak`);
    replace(
      today,
      icon("lamp", "icon sm"),
      `${minutesToday(p)} of ${s.dailyGoalMinutes} min today`,
    );
  };
  refresh();
  subscribeSettings(refresh);
  subscribeProgress(refresh);

  return {
    el: h(
      "header",
      { class: "topbar" },
      title,
      h("div", { class: "gauges" }, speed, streak, today),
    ),
    setTitle: (t) => (title.textContent = t),
  };
}

async function showRoute(
  main: HTMLElement,
  sidebar: HTMLElement,
  setTitle: (t: string) => void,
): Promise<void> {
  const token = ++navToken;
  const path = currentPath();
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES[0];

  audioPlayer.stop();
  activePage?.dispose?.();
  activePage = null;

  sidebar.querySelectorAll<HTMLAnchorElement>(".nav-link").forEach((a) => {
    const on = a.dataset.path === route.path;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  setTitle(route.title);
  document.title = `${route.title} — VSA Morse Code Trainer`;

  const mod = await route.load();
  if (token !== navToken) return;
  activePage = mod.default();
  replace(main, activePage.el);
  main.scrollTop = 0;
  main.focus({ preventScroll: true });
}

async function start(): Promise<void> {
  await Promise.all([initSettings(), initProgress()]);

  const sidebar = buildSidebar();
  const top = buildTopBar();
  const main = h("main", { class: "content", tabindex: "-1" });
  const app = document.getElementById("app");
  if (!app) return;
  replace(
    app,
    h("div", { class: "station" }, sidebar, h("div", { class: "desk" }, top.el, main)),
    h("div", { id: "toast-host", class: "toast-host", "aria-live": "polite" }),
  );

  window.addEventListener("hashchange", () => void showRoute(main, sidebar, top.setTitle));
  await showRoute(main, sidebar, top.setTitle);
}

void start();
