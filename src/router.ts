/**
 * VSA Morse Code Trainer — hash router and the list of rooms.
 */

import type { Page } from "./ui/dom";
import type { IconName } from "./ui/icons";

export interface Route {
  path: string;
  title: string;
  icon: IconName;
  group: "learn" | "practice" | "tools" | "station";
  load: () => Promise<{ default: () => Page }>;
}

export const ROUTES: Route[] = [
  { path: "/", title: "Home", icon: "home", group: "learn", load: () => import("./pages/home") },
  {
    path: "/fundamentals",
    title: "Fundamentals",
    icon: "scroll",
    group: "learn",
    load: () => import("./pages/fundamentals"),
  },
  {
    path: "/lessons",
    title: "Guided Lessons",
    icon: "path",
    group: "learn",
    load: () => import("./pages/lessons"),
  },
  {
    path: "/reference",
    title: "Reference Library",
    icon: "book",
    group: "learn",
    load: () => import("./pages/reference"),
  },
  {
    path: "/koch",
    title: "Koch Ear Trainer",
    icon: "ear",
    group: "practice",
    load: () => import("./pages/koch"),
  },
  {
    path: "/drills",
    title: "Listening Drills",
    icon: "radio",
    group: "practice",
    load: () => import("./pages/drills"),
  },
  {
    path: "/keyer",
    title: "Sending Key",
    icon: "key",
    group: "practice",
    load: () => import("./pages/keyer"),
  },
  {
    path: "/quiz",
    title: "Quizzes & Certificate",
    icon: "check",
    group: "practice",
    load: () => import("./pages/quiz"),
  },
  {
    path: "/translator",
    title: "Translator",
    icon: "swap",
    group: "tools",
    load: () => import("./pages/translator"),
  },
  {
    path: "/decoder",
    title: "Audio Decoder",
    icon: "wave",
    group: "tools",
    load: () => import("./pages/decoder"),
  },
  {
    path: "/binary",
    title: "Binary Translator",
    icon: "binary",
    group: "tools",
    load: () => import("./pages/binary"),
  },
  {
    path: "/teacher",
    title: "Teacher's Desk",
    icon: "users",
    group: "tools",
    load: () => import("./pages/teacher"),
  },
  {
    path: "/community",
    title: "Ham Community",
    icon: "globe",
    group: "station",
    load: () => import("./pages/community"),
  },
  {
    path: "/settings",
    title: "Settings",
    icon: "gear",
    group: "station",
    load: () => import("./pages/settings"),
  },
  {
    path: "/help",
    title: "Help",
    icon: "help",
    group: "station",
    load: () => import("./pages/help"),
  },
  {
    path: "/about",
    title: "About",
    icon: "info",
    group: "station",
    load: () => import("./pages/about"),
  },
];

export function currentPath(): string {
  const raw = location.hash.replace(/^#/, "") || "/";
  return ROUTES.some((r) => r.path === raw) ? raw : "/";
}

export function navigate(path: string): void {
  location.hash = path;
}
