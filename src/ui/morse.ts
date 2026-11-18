/**
 * VSA Morse Code Trainer — shared Morse widgets: dot/dash glyphs, the signal lamp and playback
 * using the student's own speed, pitch, volume and noise settings.
 */

import { audioPlayer, type PlaybackOptions } from "../audio/playback";
import {
  encodeTextToMorse,
  scheduleMorseEvents,
  TEXT_TO_MORSE_MAP,
  type MorseEvent,
} from "../engine";
import { getSettings } from "../state/settings";
import { h } from "./dom";

/** Proportional dot / dash drawing of one Morse pattern, e.g. ".-". */
export function morseGlyph(pattern: string, large = false): HTMLElement {
  const el = h("span", {
    class: `morse${large ? " lg" : ""}`,
    "aria-label": pattern.replace(/\./g, "dit ").replace(/-/g, "dah "),
  });
  for (const c of pattern) {
    if (c === "." || c === "-") el.append(h("span", { class: c === "." ? "dit" : "dah" }));
  }
  return el;
}

export function patternOf(char: string): string {
  return TEXT_TO_MORSE_MAP.get(char.toUpperCase()) ?? "";
}

export interface Lamp {
  el: HTMLElement;
  set: (on: boolean) => void;
}

export function signalLamp(large = false): Lamp {
  const el = h("div", {
    class: `lamp${large ? " lg" : ""}`,
    role: "img",
    "aria-label": "Signal lamp",
  });
  return { el, set: (on) => el.classList.toggle("on", on) };
}

/** Timeline for text at the current speed settings (Farnsworth spacing included). */
export function eventsForText(
  text: string,
  overrides?: { charWpm?: number; effWpm?: number },
): MorseEvent[] {
  const s = getSettings();
  const morse = encodeTextToMorse(text).morse;
  return scheduleMorseEvents(morse, {
    charSpeedWpm: overrides?.charWpm ?? s.charSpeedWpm,
    effectiveSpeedWpm: overrides?.effWpm ?? s.effectiveSpeedWpm,
  });
}

/** Plays text with the student's settings; drives an optional lamp. Resolves when finished or stopped. */
export function playText(
  text: string,
  opts: {
    lamp?: Lamp;
    loop?: boolean;
    charWpm?: number;
    effWpm?: number;
    noise?: boolean;
    onEventStart?: PlaybackOptions["onEventStart"];
  } = {},
): Promise<void> {
  const s = getSettings();
  const events = eventsForText(text, opts);
  return new Promise((resolve) => {
    if (events.length === 0) {
      resolve();
      return;
    }
    void audioPlayer.playEvents(events, {
      pitchHz: s.pitchHz,
      volumePct: s.volumePct,
      noiseLevelPct: opts.noise === false ? 0 : s.noiseLevel,
      loop: opts.loop,
      onEventStart: (ev, i) => {
        if (ev.type === "on") opts.lamp?.set(true);
        opts.onEventStart?.(ev, i);
      },
      onEventEnd: () => opts.lamp?.set(false),
      onFinished: () => {
        opts.lamp?.set(false);
        resolve();
      },
    });
  });
}

export function stopPlayback(lamp?: Lamp): void {
  audioPlayer.stop();
  lamp?.set(false);
}
