/**
 * Settings — sound, speed, keying, learning goals, and backup / restore of all data.
 */

import {
  chooseOpenPath,
  chooseSavePath,
  errorText,
  exportText,
  isDesktop,
  loadDoc,
  readTextFile,
  saveDoc,
} from "../api";
import { getProgress, updateProgress, EMPTY_PROGRESS, type Progress } from "../state/progress";
import {
  getSettings,
  resetSettings,
  sanitizeSettings,
  updateSettings,
  type KeyMode,
} from "../state/settings";
import { h, replace, slider, toast, type Page } from "../ui/dom";
import { icon } from "../ui/icons";
import { playText, signalLamp } from "../ui/morse";

interface Backup {
  app: "VSA Morse Code Trainer";
  version: string;
  savedAt: string;
  settings: unknown;
  progress: unknown;
  roster?: unknown;
}

export default function settingsPage(): Page {
  const body = h("div", { class: "page" });
  const lamp = signalLamp();

  const render = () => {
    const s = getSettings();
    const keyField = h("input", {
      type: "text",
      value: s.keyBinding,
      readonly: true,
      "aria-label": "Straight key",
    });
    keyField.addEventListener("keydown", (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code === "Tab" || e.code === "Escape") return;
      updateSettings({ keyBinding: e.code });
      keyField.value = e.code;
    });
    const modeSelect = h(
      "select",
      {
        onchange: (e: Event) =>
          updateSettings({ keyMode: (e.target as HTMLSelectElement).value as KeyMode }),
      },
      (
        [
          ["straight", "Straight key (hold for dit or dah)"],
          ["iambic-a", "Iambic paddle, mode A"],
          ["iambic-b", "Iambic paddle, mode B"],
        ] as const
      ).map(([v, label]) => h("option", { value: v, selected: s.keyMode === v }, label)),
    );

    replace(
      body,
      h(
        "div",
        { class: "stack" },
        h("h2", null, "Settings"),
        h("p", { class: "lead" }, "Changes are saved automatically."),
      ),
      h(
        "div",
        { class: "grid two" },
        h(
          "section",
          { class: "card stack" },
          h("h3", null, "Sound"),
          slider({
            label: "Tone pitch",
            min: 300,
            max: 1000,
            step: 10,
            value: s.pitchHz,
            unit: " Hz",
            onInput: (v) => updateSettings({ pitchHz: v }),
          }),
          slider({
            label: "Volume",
            min: 0,
            max: 100,
            value: s.volumePct,
            unit: "%",
            onInput: (v) => updateSettings({ volumePct: v }),
          }),
          slider({
            label: "Background radio noise",
            min: 0,
            max: 100,
            value: s.noiseLevel,
            unit: "%",
            onInput: (v) => updateSettings({ noiseLevel: v }),
          }),
          h(
            "div",
            { class: "row" },
            lamp.el,
            h(
              "button",
              { class: "btn", onclick: () => void playText("PARIS", { lamp }) },
              icon("play", "icon sm"),
              "Test: send PARIS",
            ),
          ),
        ),
        h(
          "section",
          { class: "card stack" },
          h("h3", null, "Speed"),
          slider({
            label: "Character speed",
            min: 5,
            max: 50,
            value: s.charSpeedWpm,
            unit: " WPM",
            onInput: (v) =>
              updateSettings({
                charSpeedWpm: v,
                effectiveSpeedWpm: Math.min(getSettings().effectiveSpeedWpm, v),
              }),
          }),
          slider({
            label: "Farnsworth (overall) speed",
            min: 3,
            max: 50,
            value: s.effectiveSpeedWpm,
            unit: " WPM",
            onInput: (v) => updateSettings({ effectiveSpeedWpm: v }),
          }),
          h(
            "p",
            { class: "small muted" },
            "Letters are sent at the character speed; the gaps between them are stretched so the overall pace matches the Farnsworth speed. 20 / 10 WPM is a good start.",
          ),
        ),
        h(
          "section",
          { class: "card stack" },
          h("h3", null, "Sending key"),
          h("label", { class: "field" }, "Keying style", modeSelect),
          h(
            "label",
            { class: "field" },
            "Straight-key button (click here, then press a key)",
            keyField,
          ),
          h(
            "p",
            { class: "small muted" },
            "Paddles use the Left and Right Ctrl keys, or [ and ]. The mouse works too: press on the brass key.",
          ),
        ),
        h(
          "section",
          { class: "card stack" },
          h("h3", null, "Learning"),
          slider({
            label: "Daily practice goal",
            min: 5,
            max: 120,
            step: 5,
            value: s.dailyGoalMinutes,
            unit: " min",
            onInput: (v) => updateSettings({ dailyGoalMinutes: v }),
          }),
          slider({
            label: "Koch: unlock next character at",
            min: 70,
            max: 100,
            value: s.kochUnlockPct,
            unit: "%",
            onInput: (v) => updateSettings({ kochUnlockPct: v }),
          }),
          slider({
            label: "Lessons: pass mark",
            min: 50,
            max: 100,
            value: s.unlockAccuracyPct,
            unit: "%",
            onInput: (v) => updateSettings({ unlockAccuracyPct: v }),
          }),
          slider({
            label: "Text size",
            min: 14,
            max: 20,
            value: s.fontSize,
            unit: " px",
            onInput: (v) => updateSettings({ fontSize: v }),
          }),
          h(
            "label",
            { class: "check" },
            h("input", {
              type: "checkbox",
              checked: s.reducedMotion,
              onchange: (e: Event) =>
                updateSettings({ reducedMotion: (e.target as HTMLInputElement).checked }),
            }),
            "Reduce animation",
          ),
        ),
      ),
      h(
        "section",
        { class: "card stack" },
        h("h3", null, "Backup and restore"),
        h(
          "p",
          { class: "small muted" },
          "Save your settings, progress and class roster to one file, or bring them back from a backup.",
        ),
        h(
          "div",
          { class: "row" },
          h(
            "button",
            { class: "btn", onclick: () => void backup() },
            icon("download", "icon sm"),
            "Save a backup…",
          ),
          h(
            "button",
            { class: "btn ebony", onclick: () => void restore() },
            icon("upload", "icon sm"),
            "Restore from a backup…",
          ),
          h(
            "button",
            { class: "btn ghost", onclick: resetAll },
            icon("reset", "icon sm"),
            "Reset settings to defaults",
          ),
        ),
      ),
    );
  };

  const backup = async () => {
    if (!isDesktop()) return toast("Backups work in the desktop app.", "error");
    try {
      const path = await chooseSavePath(
        `vsa-morse-trainer-backup-${new Date().toISOString().slice(0, 10)}.json`,
        { name: "Backup", extensions: ["json"] },
      );
      if (!path) return;
      const data: Backup = {
        app: "VSA Morse Code Trainer",
        version: __APP_VERSION__,
        savedAt: new Date().toISOString(),
        settings: getSettings(),
        progress: getProgress(),
        roster: (await loadDoc("roster")) ?? undefined,
      };
      await exportText(path, JSON.stringify(data, null, 2));
      toast("Backup saved.");
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  const restore = async () => {
    if (!isDesktop()) return toast("Restoring works in the desktop app.", "error");
    try {
      const path = await chooseOpenPath({ name: "Backup", extensions: ["json"] });
      if (!path) return;
      const data = JSON.parse(await readTextFile(path)) as Partial<Backup>;
      if (data.app !== "VSA Morse Code Trainer")
        throw new Error("This file is not a VSA Morse Code Trainer backup.");
      if (
        !window.confirm(
          "Replace your current settings and progress with this backup? Your current data will be replaced.",
        )
      )
        return;
      updateSettings(sanitizeSettings(data.settings));
      updateProgress((p) =>
        Object.assign(
          p,
          structuredClone(EMPTY_PROGRESS),
          (data.progress ?? {}) as Partial<Progress>,
        ),
      );
      if (data.roster) {
        await saveDoc("roster", data.roster);
      }
      toast("Backup restored.");
      render();
    } catch (e) {
      toast(errorText(e), "error");
    }
  };

  const resetAll = () => {
    if (window.confirm("Put all settings back to their defaults? Your progress is kept.")) {
      resetSettings();
      render();
    }
  };

  render();
  return { el: body };
}
