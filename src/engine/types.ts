/**
 * VSA Morse Code Trainer — Engine Types
 *
 * Pure TypeScript types for the core Morse engine.
 * No DOM or React dependencies.
 */

export type MorseElement = "." | "-";

export interface MorseEvent {
  /** 'on' = sound/tone/light active, 'off' = silence/gap */
  type: "on" | "off";
  /** Exact duration in milliseconds */
  durationMs: number;
  /** Associated character, if applicable */
  char?: string;
  /** Granular event description for visualizers */
  kind?: "dit" | "dah" | "intra-char-gap" | "inter-char-gap" | "inter-word-gap";
}

export interface UnsupportedChar {
  char: string;
  /** 0-based position in input text */
  position: number;
}

export interface UnknownMorsePattern {
  pattern: string;
  /** 0-based word/element index */
  position: number;
}

export interface EncodeResult {
  /** Encoded Morse string with standard spacing: 1 space between letters, '/' between words */
  morse: string;
  /** List of characters that could not be mapped to ITU Morse */
  unsupportedChars: UnsupportedChar[];
}

export interface DecodeResult {
  /** Decoded plain text in uppercase */
  text: string;
  /** Morse patterns that do not exist in ITU Morse */
  unknownPatterns: UnknownMorsePattern[];
}

export interface TimingConfig {
  /** Character speed in Words Per Minute (e.g. 20 WPM) */
  charSpeedWpm: number;
  /** Effective speed in Words Per Minute using Farnsworth spacing (e.g. 10 WPM) */
  effectiveSpeedWpm: number;
}

export interface TimingUnits {
  /** Duration of 1 standard unit (dot) in milliseconds */
  unitMs: number;
  /** Duration of a dot in milliseconds (1 unit) */
  ditMs: number;
  /** Duration of a dash in milliseconds (3 units) */
  dahMs: number;
  /** Gap between dots/dashes inside a character (1 unit) */
  intraCharGapMs: number;
  /** Gap between characters (standard 3 units, or Farnsworth stretched) */
  interCharGapMs: number;
  /** Gap between words (standard 7 units, or Farnsworth stretched) */
  interWordGapMs: number;
  /** Extra delay per Farnsworth unit in seconds (t_a) */
  taSeconds: number;
}

export interface MirrorPair {
  char1: string;
  morse1: string;
  char2: string;
  morse2: string;
  isSelfMirror: boolean;
}

export interface KochStats {
  character: string;
  attempts: number;
  correct: number;
  accuracyPct: number;
  recentErrors: number;
}

export interface TappingRawPress {
  /** Press duration in milliseconds */
  pressMs: number;
  /** Release duration following the press in milliseconds */
  gapMs: number;
}

export interface ClassifiedElement {
  type: "dit" | "dah";
  durationMs: number;
  followingGapType: "intra-char" | "inter-char" | "inter-word" | "trailing";
  followingGapMs: number;
}

export interface ScoringResult {
  /** Overall sending score from 0 to 100 */
  overallScore: number;
  /** Text accuracy score from 0 to 100 */
  accuracyScore: number;
  /** Timing quality score from 0 to 100 */
  timingScore: number;
  /** Measured dash-to-dot ratio (ideal 3.0) */
  dashDotRatio: number;
  /** Measured average dot duration in ms */
  averageDotMs: number;
  /** Estimated sending speed in WPM */
  estimatedWpm: number;
  /** Actionable constructive coaching suggestions */
  feedbackTips: string[];
}
