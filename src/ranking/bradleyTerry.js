// Bradley-Terry fit via the MM algorithm (Hunter, 2004). Pure JS — no Vue imports.
//
// Each idol i has strength s_i > 0, with P(i beats j) = s_i / (s_i + s_j).
// Prior: each idol plays `alpha` virtual wins and `alpha` virtual losses against a
// fixed reference player of strength 1. This keeps every strength finite and
// positive, and pins the scale so no normalization step is needed.
//
//   s_i <- (w_i + alpha) / ( sum_j n_ij / (s_i + s_j) + 2*alpha / (s_i + 1) )

/**
 * @param {string[]} idolIds
 * @param {{ winnerId: string, loserId: string, outcome?: 'tie' }[]} comparisons
 * @returns {{ id: string, strength: number }[]} sorted by strength, descending
 */
export function fitBradleyTerry(
  idolIds,
  comparisons,
  { alpha = 1, tolerance = 1e-6, maxIterations = 1000 } = {},
) {
  const n = idolIds.length
  const index = new Map(idolIds.map((id, i) => [id, i]))

  const wins = new Array(n).fill(0)
  // games[i][j] = number of real comparisons between i and j
  const games = Array.from({ length: n }, () => new Array(n).fill(0))

  for (const { winnerId, loserId, outcome } of comparisons) {
    const w = index.get(winnerId)
    const l = index.get(loserId)
    // Ignore ids no longer in the dataset (R8) and malformed self-comparisons.
    if (w === undefined || l === undefined || w === l) continue
    // A tie (P1-3) is one game with half a win to each idol; the id order means nothing.
    if (outcome === 'tie') {
      wins[w] += 0.5
      wins[l] += 0.5
    } else {
      wins[w]++
    }
    games[w][l]++
    games[l][w]++
  }

  let strengths = new Array(n).fill(1)

  for (let iter = 0; iter < maxIterations; iter++) {
    const next = new Array(n)
    let maxRelChange = 0

    for (let i = 0; i < n; i++) {
      const si = strengths[i]
      let denom = (2 * alpha) / (si + 1)
      for (let j = 0; j < n; j++) {
        if (games[i][j] > 0) denom += games[i][j] / (si + strengths[j])
      }
      next[i] = (wins[i] + alpha) / denom
      maxRelChange = Math.max(maxRelChange, Math.abs(next[i] - si) / si)
    }

    strengths = next
    if (maxRelChange < tolerance) break
  }

  return idolIds
    .map((id, i) => ({ id, strength: strengths[i] }))
    .sort((a, b) => b.strength - a.strength)
}
