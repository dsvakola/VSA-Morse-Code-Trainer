/**
 * VSA Morse Code Trainer — Sample-Accurate Web Audio Playback Engine
 *
 * Requirements:
 * - Uses AudioContext.currentTime for sample-accurate oscillator gain envelope scheduling.
 * - Never relies on setTimeout for audio timing (timers only drive the visual lamp).
 * - Applies a 5 ms attack/release ramp to every element, and to Stop, to avoid key clicks.
 * - Supports frequency adjustment (300-1000 Hz, default 600 Hz).
 * - Mixes optional atmospheric QRM/QRN noise through the same master volume.
 * - Keeps the key-tapping sidetone on its own voice, so it never fights with playback.
 */

import { MorseEvent } from "../engine/types";
import { NoiseGenerator } from "./noise";

export interface PlaybackOptions {
  pitchHz?: number; // 300 to 1000 Hz, default 600
  volumePct?: number; // 0 to 100%, default 80
  noiseLevelPct?: number; // 0 to 100%, default 0
  loop?: boolean;
  /** Silence between loop repeats in ms. Defaults to the sequence's word gap (or 7 dits). */
  loopGapMs?: number;
  onEventStart?: (event: MorseEvent, index: number) => void;
  onEventEnd?: (event: MorseEvent, index: number) => void;
  onFinished?: () => void;
}

const RAMP_SECONDS = 0.005; // 5 ms anti-click ramp
const PRE_ROLL_SECONDS = 0.05; // 50 ms scheduling head-room

interface Voice {
  oscillator: OscillatorNode;
  envelope: GainNode;
  master: GainNode;
}

const clampPitch = (hz: number | undefined) => Math.max(300, Math.min(1000, hz || 600));
const clampVolume = (pct: number | undefined) => Math.max(0, Math.min(1, (pct ?? 80) / 100));

export class MorseAudioPlayer {
  private audioCtx: AudioContext | null = null;

  // Playback voice
  private voice: Voice | null = null;
  private noiseGenerator: NoiseGenerator | null = null;
  private isPlaying = false;
  private playbackToken = 0;
  private scheduledStopTimer: ReturnType<typeof setTimeout> | null = null;
  private visualTimers: Array<ReturnType<typeof setTimeout>> = [];

  // Sidetone voice (key tapping)
  private sidetone: Voice | null = null;
  private sidetoneWanted = false;

  /**
   * Initializes or resumes the AudioContext (browser audio gesture requirement).
   */
  private async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  /** Builds oscillator -> envelope gain -> master gain -> speakers. The envelope starts silent. */
  private createVoice(ctx: AudioContext, pitchHz: number, volume: number): Voice {
    const master = ctx.createGain();
    master.gain.setValueAtTime(volume, ctx.currentTime);
    master.connect(ctx.destination);

    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, ctx.currentTime);
    envelope.connect(master);

    const oscillator = ctx.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(pitchHz, ctx.currentTime);
    oscillator.connect(envelope);
    oscillator.start();

    return { oscillator, envelope, master };
  }

  /** Fades a voice out over 5 ms, then stops and disconnects every node. */
  private releaseVoice(voice: Voice): void {
    const ctx = this.audioCtx;
    if (ctx) {
      const now = ctx.currentTime;
      voice.envelope.gain.cancelScheduledValues(now);
      voice.envelope.gain.setValueAtTime(voice.envelope.gain.value, now);
      voice.envelope.gain.linearRampToValueAtTime(0, now + RAMP_SECONDS);
    }
    setTimeout(() => {
      try {
        voice.oscillator.stop();
      } catch {
        // Already stopped
      }
      voice.oscillator.disconnect();
      voice.envelope.disconnect();
      voice.master.disconnect();
    }, 20);
  }

  /**
   * Plays an array of scheduled Morse events using sample-accurate Web Audio envelopes.
   */
  public async playEvents(events: MorseEvent[], options: PlaybackOptions = {}): Promise<void> {
    if (!events || events.length === 0) return;

    this.stop();
    const token = ++this.playbackToken;

    const ctx = await this.ensureAudioContext();
    if (token !== this.playbackToken) return; // stop() or another play happened meanwhile

    this.isPlaying = true;
    const voice = this.createVoice(
      ctx,
      clampPitch(options.pitchHz),
      clampVolume(options.volumePct),
    );
    this.voice = voice;

    const noiseLevel = options.noiseLevelPct || 0;
    if (noiseLevel > 0) {
      this.noiseGenerator = new NoiseGenerator(ctx);
      this.noiseGenerator.start(noiseLevel, voice.master);
    }

    this.scheduleSequence(ctx, voice, events, options, ctx.currentTime + PRE_ROLL_SECONDS, token);
  }

  /** Schedules one pass of the sequence starting at `startTime`; re-schedules itself when looping. */
  private scheduleSequence(
    ctx: AudioContext,
    voice: Voice,
    events: MorseEvent[],
    options: PlaybackOptions,
    startTime: number,
    token: number,
  ): void {
    const gain = voice.envelope.gain;
    let cursorTime = startTime;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const durationSeconds = event.durationMs / 1000;

      if (event.type === "on") {
        const toneEndTime = cursorTime + durationSeconds;
        gain.setValueAtTime(0, cursorTime);
        gain.linearRampToValueAtTime(1.0, cursorTime + RAMP_SECONDS);
        gain.setValueAtTime(1.0, Math.max(cursorTime + RAMP_SECONDS, toneEndTime - RAMP_SECONDS));
        gain.linearRampToValueAtTime(0, toneEndTime);
      }

      // UI callbacks for the pilot lamp, aligned with the audio clock
      const delayToStartMs = Math.max(0, (cursorTime - ctx.currentTime) * 1000);
      const delayToEndMs = Math.max(0, (cursorTime + durationSeconds - ctx.currentTime) * 1000);
      if (options.onEventStart) {
        this.visualTimers.push(
          setTimeout(() => {
            if (token === this.playbackToken) options.onEventStart?.(event, i);
          }, delayToStartMs),
        );
      }
      if (options.onEventEnd) {
        this.visualTimers.push(
          setTimeout(() => {
            if (token === this.playbackToken) options.onEventEnd?.(event, i);
          }, delayToEndMs),
        );
      }

      cursorTime += durationSeconds;
    }

    const endDelayMs = Math.max(0, (cursorTime - ctx.currentTime) * 1000);

    if (options.loop) {
      const gapMs = options.loopGapMs ?? defaultLoopGapMs(events);
      const nextStart = cursorTime + gapMs / 1000;
      // Schedule the next pass shortly before it is due, so Stop stays responsive.
      const wakeMs = Math.max(0, (nextStart - ctx.currentTime) * 1000 - 250);
      this.scheduledStopTimer = setTimeout(() => {
        if (token !== this.playbackToken) return;
        this.visualTimers = [];
        this.scheduleSequence(ctx, voice, events, options, nextStart, token);
      }, wakeMs);
    } else {
      this.scheduledStopTimer = setTimeout(() => {
        if (token !== this.playbackToken) return;
        this.stop();
        options.onFinished?.();
      }, endDelayMs);
    }
  }

  /**
   * Stops playback with a 5 ms fade (no click) and cancels all scheduled events.
   */
  public stop(): void {
    this.playbackToken++;
    this.isPlaying = false;

    if (this.scheduledStopTimer) {
      clearTimeout(this.scheduledStopTimer);
      this.scheduledStopTimer = null;
    }

    for (const timer of this.visualTimers) {
      clearTimeout(timer);
    }
    this.visualTimers = [];

    if (this.noiseGenerator) {
      this.noiseGenerator.stop();
      this.noiseGenerator = null;
    }

    if (this.voice) {
      this.releaseVoice(this.voice);
      this.voice = null;
    }
  }

  /**
   * Starts the key-down sidetone (5 ms attack). Safe to call before the audio device is ready:
   * if the key is released first, no tone is left sounding.
   */
  public startSidetone(pitchHz = 600, volumePct = 80): void {
    this.sidetoneWanted = true;

    const ctx = this.audioCtx;
    if (ctx && ctx.state === "running") {
      this.openSidetone(ctx, pitchHz, volumePct);
      return;
    }

    void this.ensureAudioContext().then((readyCtx) => {
      if (this.sidetoneWanted) {
        this.openSidetone(readyCtx, pitchHz, volumePct);
      }
    });
  }

  private openSidetone(ctx: AudioContext, pitchHz: number, volumePct: number): void {
    if (this.sidetone) return;
    const voice = this.createVoice(ctx, clampPitch(pitchHz), clampVolume(volumePct));
    voice.envelope.gain.linearRampToValueAtTime(1.0, ctx.currentTime + RAMP_SECONDS);
    this.sidetone = voice;
  }

  /**
   * Ends the sidetone with a 5 ms release and frees its audio nodes.
   */
  public stopSidetone(): void {
    this.sidetoneWanted = false;
    if (this.sidetone) {
      this.releaseVoice(this.sidetone);
      this.sidetone = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

/** Gap between loop repeats: the sequence's own word gap, or 7 dits if it has none. */
export function defaultLoopGapMs(events: MorseEvent[]): number {
  const wordGap = events.find((e) => e.kind === "inter-word-gap");
  if (wordGap) return wordGap.durationMs;
  const dit = events.find((e) => e.kind === "dit");
  const dah = events.find((e) => e.kind === "dah");
  const unit = dit ? dit.durationMs : dah ? dah.durationMs / 3 : 60;
  return 7 * unit;
}

// Global audio player singleton
export const audioPlayer = new MorseAudioPlayer();
