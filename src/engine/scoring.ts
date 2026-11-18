/**
 * VSA Morse Code Trainer — Sending Practice Scoring & Feedback Engine
 *
 * Evaluates student's sending attempts across:
 * 1. Text accuracy (target vs decoded text alignment)
 * 2. Timing quality (dash/dot ratio, rhythm consistency, gap accuracy)
 * 3. Specific, actionable pedagogical feedback
 */

import { ClassificationOutput } from "./classifier";
import { ScoringResult } from "./types";

/**
 * Computes Levenshtein edit distance between two strings.
 */
export function computeLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Computes text accuracy percentage from 0 to 100.
 */
export function computeTextAccuracy(target: string, decoded: string): number {
  const normTarget = target.trim().toUpperCase();
  const normDecoded = decoded.trim().toUpperCase();

  if (normTarget === normDecoded) {
    return 100;
  }
  if (normTarget.length === 0 || normDecoded.length === 0) {
    return 0;
  }

  const distance = computeLevenshteinDistance(normTarget, normDecoded);
  const maxLength = Math.max(normTarget.length, normDecoded.length);
  const accuracy = Math.max(0, 1 - distance / maxLength);

  return Math.round(accuracy * 100);
}

/**
 * Evaluates sending performance and produces an overall 0-100 score + coaching advice.
 *
 * @param targetText The text the student was tasked with sending
 * @param classification The output from classifyTappingStream
 */
export function scoreSendingPerformance(
  targetText: string,
  classification: ClassificationOutput,
): ScoringResult {
  const accuracyScore = computeTextAccuracy(targetText, classification.decodedText);
  const ratio = classification.dashDotRatio;
  const feedbackTips: string[] = [];

  // Evaluate dash-to-dot ratio (ideal 3.0:1)
  let ratioScore = 100;
  const ratioDiff = Math.abs(ratio - 3.0);

  if (ratioDiff > 0.3) {
    // Deduct points proportionally
    ratioScore = Math.max(20, Math.round(100 - ratioDiff * 35));

    if (ratio < 2.5) {
      feedbackTips.push(
        `Your dashes are too short (measured ${ratio}:1 instead of 3.0:1). Hold dashes three times as long as dots.`,
      );
    } else if (ratio > 3.7) {
      feedbackTips.push(
        `Your dashes are slightly stretched (${ratio}:1). Shorten your dahs so they remain crisp at 3 units.`,
      );
    }
  }

  // Evaluate gap spacing consistency
  let gapScore = 100;
  const unit = classification.unitLengthMs;

  const intraGaps = classification.elements
    .filter((e) => e.followingGapType === "intra-char")
    .map((e) => e.followingGapMs);

  const interCharGaps = classification.elements
    .filter((e) => e.followingGapType === "inter-char")
    .map((e) => e.followingGapMs);

  // Check if inter-character gaps are too tight (leading to characters running together)
  if (interCharGaps.length > 0) {
    const avgInterChar = interCharGaps.reduce((a, b) => a + b, 0) / interCharGaps.length;
    if (avgInterChar < 2.2 * unit) {
      gapScore -= 20;
      feedbackTips.push(
        "Leave a slightly longer pause (3 units) between characters so letters don't run together.",
      );
    }
  }

  // Check if intra-character gaps are excessively long
  if (intraGaps.length > 0) {
    const avgIntra = intraGaps.reduce((a, b) => a + b, 0) / intraGaps.length;
    if (avgIntra > 1.8 * unit) {
      gapScore -= 15;
      feedbackTips.push("Keep the pause between dits and dahs inside a character short (1 unit).");
    }
  }

  // Combined timing score (60% ratio, 40% gaps)
  const timingScore = Math.round(ratioScore * 0.6 + Math.max(0, gapScore) * 0.4);

  // Overall score: 60% text accuracy, 40% timing quality
  const overallScore = Math.round(accuracyScore * 0.6 + timingScore * 0.4);

  if (feedbackTips.length === 0) {
    if (overallScore >= 90) {
      feedbackTips.push("Outstanding sending cadence! Steady rhythm and correct 3:1 ratio.");
    } else if (accuracyScore < 80) {
      feedbackTips.push(
        "Focus on character accuracy first; rhythm and speed will follow with practice.",
      );
    } else {
      feedbackTips.push("Good consistency! Continue practicing steady spacing.");
    }
  }

  return {
    overallScore,
    accuracyScore,
    timingScore,
    dashDotRatio: ratio,
    averageDotMs: classification.unitLengthMs,
    estimatedWpm: classification.estimatedWpm,
    feedbackTips,
  };
}
