/**
 * VSA Morse Code Trainer — line icons drawn for this app (24 px grid, stroke = currentColor).
 */

import { svg } from "./dom";

const P: Record<string, string> = {
  home: "M3 11 12 4l9 7M5 10v10h5v-6h4v6h5V10",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13",
  scroll:
    "M6 3h11a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-1h11v1a2 2 0 0 0 2 2M6 3a2 2 0 0 0-2 2v2h2M9 8h6M9 12h6",
  path: "M5 19c3 0 3-4 6-4s3 4 6 4M5 5h.01M12 9h.01M19 5h.01M5 5c0 3 7 1 7 4m0 0c0-3 7-1 7-4",
  ear: "M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0",
  radio: "M4 9h16v11H4zM8 9 17 4M8 15h.01M15 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  key: "M3 18h18v2H3zM5 18v-3h14v3M6 15l12-4M17 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4M8 15v-3",
  check: "M5 4h14v17H5zM9 4V3h6v1M8 12l2.5 2.5L16 9",
  swap: "M4 8h13l-3-3M20 16H7l3 3",
  binary: "M5 5v6M9 5h2v6H9zM15 5h2v6h-2zM19 5v6M5 13h2v6H5zM11 13v6M15 13v6M17 13h2v6h-2z",
  wave: "M2 12h3l2-6 3 12 3-9 2 6 2-3h5",
  users:
    "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M2 20a6 6 0 0 1 12 0M16 11a3 3 0 1 0 0-6M22 20a6 6 0 0 0-5-6",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19 12l2-1-1-3-2 .2-1.3-1.4.2-2-3-1-1 2h-1.8l-1-2-3 1 .2 2L6 7.3 4 7 3 10l2 1v2l-2 1 1 3 2-.2 1.3 1.4-.2 2 3 1 1-2h1.8l1 2 3-1-.2-2 1.3-1.4 2 .2 1-3-2-1z",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17h.01",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 11v6M12 7h.01",
  play: "M7 4v16l13-8z",
  stop: "M6 6h12v12H6z",
  repeat: "M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3",
  download: "M12 3v12m0 0-4-4m4 4 4-4M4 17v3h16v-3",
  upload: "M12 15V3m0 0L8 7m4-4 4 4M4 17v3h16v-3",
  copy: "M8 8h12v12H8zM4 16V4h12",
  flame: "M12 21c-4 0-7-3-7-7 0-4 4-6 4-10 3 2 4 4 4 6 1-1 2-2 2-4 2 2 4 5 4 8 0 4-3 7-7 7Z",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 7v5l3 2",
  lamp: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11v2h6v-2a6 6 0 0 0-3-11",
  print: "M7 9V3h10v6M7 17H4v-8h16v8h-3M7 14h10v7H7z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14M21 21l-5-5",
  trophy:
    "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9z",
  reset: "M4 12a8 8 0 1 0 2.3-5.7M4 4v5h5",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  plus: "M12 5v14M5 12h14",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  arrowRight: "M5 12h14m-5-5 5 5-5 5",
  arrowLeft: "M19 12H5m5-5-5 5 5 5",
};

export type IconName = keyof typeof P;

export function icon(name: IconName, className = "icon"): SVGSVGElement {
  return svg(
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[name]}"/></svg>`,
    className,
  );
}
