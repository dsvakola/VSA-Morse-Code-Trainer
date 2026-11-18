/**
 * Compares what the student typed with what was sent, character by character.
 * Uses an edit-distance alignment so one missed letter does not mark everything after it wrong.
 */

export interface CharResult {
  expected: string;
  got: string | null;
  correct: boolean;
}

/** Splits text into Morse "characters", keeping prosigns like <AR> together. Spaces are dropped. */
export function tokens(text: string): string[] {
  const out: string[] = [];
  const re = /<[A-Z]+>|\S/g;
  for (const m of text.toUpperCase().matchAll(re)) out.push(m[0]);
  return out;
}

export function compareCopy(
  sent: string,
  typed: string,
): { results: CharResult[]; correct: number; total: number } {
  const a = tokens(sent);
  const b = tokens(typed);
  const n = a.length;
  const m = b.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  // Walk back to align each sent character with what was typed for it.
  const results: CharResult[] = [];
  let i = n;
  let j = m;
  while (i > 0) {
    if (j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      results.push({ expected: a[i - 1], got: b[j - 1], correct: a[i - 1] === b[j - 1] });
      i--;
      j--;
    } else if (d[i][j] === d[i - 1][j] + 1) {
      results.push({ expected: a[i - 1], got: null, correct: false });
      i--;
    } else {
      j--;
    }
  }
  results.reverse();
  const correct = results.filter((r) => r.correct).length;
  return { results, correct, total: n };
}
