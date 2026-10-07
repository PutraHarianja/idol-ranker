// Display helpers on top of the Bradley-Terry fit (R6, R7). Pure JS — no Vue imports.

/** Goddess Score: % chance of beating an average (strength 1) idol, as an integer 0–100. */
export function goddessScore(strength) {
  return Math.round((strength / (strength + 1)) * 100)
}

/**
 * Adds score and rank to a strength-sorted fit. Equal rounded scores share a rank (1, 1, 3).
 * @param {{ id: string, strength: number }[]} fitted  sorted by strength, descending
 * @returns {{ id: string, strength: number, score: number, rank: number }[]}
 */
export function rankWithScores(fitted) {
  let rank = 0
  return fitted.map((entry, i, all) => {
    const score = goddessScore(entry.strength)
    if (i === 0 || score !== goddessScore(all[i - 1].strength)) rank = i + 1
    return { ...entry, score, rank }
  })
}

/** Decisions needed before the ranking counts as ready: ⌈1.5 × N⌉. */
export function comparisonTarget(idolCount) {
  return Math.ceil(1.5 * idolCount)
}

export const MIN_APPEARANCES = 3
