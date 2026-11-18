/**
 * VSA Morse Code Trainer — the brass telegraph key artwork (the same drawing as the app icon).
 * The lever can be pressed visually, e.g. while the student keys or while Morse plays.
 */

import keySvg from "../../assets/brand/app-icon.svg?raw";
import { svg } from "./dom";

export interface TelegraphKeyArt {
  el: SVGSVGElement;
  setPressed: (down: boolean) => void;
}

export function telegraphKey(className = "key-art"): TelegraphKeyArt {
  const el = svg(keySvg, className);
  el.removeAttribute("width");
  el.removeAttribute("height");
  el.setAttribute("role", "img");
  el.setAttribute("aria-label", "Brass straight telegraph key");
  const lever = el.querySelector<SVGGElement>(".key-lever");
  return {
    el,
    setPressed: (down) => lever?.classList.toggle("pressed", down),
  };
}
