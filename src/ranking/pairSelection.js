// Random pair selection with coverage balancing (R3). Pure JS — no Vue imports.

/** Counts how many logged decisions each idol has appeared in. */
export function countAppearances(idolIds, comparisons) {
  const counts = new Map(idolIds.map((id) => [id, 0]))
  for (const { winnerId, loserId } of comparisons) {
    if (counts.has(winnerId)) counts.set(winnerId, counts.get(winnerId) + 1)
    if (counts.has(loserId)) counts.set(loserId, counts.get(loserId) + 1)
  }
  return counts
}

function pickRandom(items, random) {
  return items[Math.floor(random() * items.length)]
}

// Adaptive pairing (P1-2) starts once every idol has this many appearances.
export const ADAPTIVE_MIN_APPEARANCES = 3
// The second idol is picked at random among this many closest-strength candidates.
const ADAPTIVE_CANDIDATES = 3

/**
 * Picks the next pair to show.
 * - First idol: random among those with the fewest appearances.
 * - Second idol: random among the least-seen of the rest, avoiding a repeat of `lastPair`
 *   (either order). With no skips, every idol has exactly 3 appearances after 1.5 × N picks.
 * - Adaptive (P1-2): once every idol has ADAPTIVE_MIN_APPEARANCES and `strengths` is given,
 *   the second idol is instead random among the few closest in strength to the first —
 *   the most informative comparisons.
 * - Left/right order is randomized.
 *
 * @param {string[]} idolIds  at least 2 ids
 * @param {{ winnerId: string, loserId: string }[]} comparisons
 * @param {{ lastPair?: [string, string] | null, strengths?: Map<string, number> | null, random?: () => number }} options
 * @returns {[string, string]} [leftId, rightId]
 */
export function selectPair(
  idolIds,
  comparisons,
  { lastPair = null, strengths = null, random = Math.random } = {},
) {
  if (idolIds.length < 2) throw new Error('selectPair needs at least 2 idols')

  const counts = countAppearances(idolIds, comparisons)
  const minCount = Math.min(...counts.values())
  const first = pickRandom(
    idolIds.filter((id) => counts.get(id) === minCount),
    random,
  )

  const rest = idolIds.filter((id) => id !== first)
  // If `first` was in the last pair, exclude its partner so the pair doesn't repeat.
  // With only 2 idols a repeat is unavoidable, so fall back to `rest`.
  const lastPartner =
    lastPair && lastPair.includes(first) ? lastPair.find((id) => id !== first) : null
  const allowed = rest.filter((id) => id !== lastPartner)
  const pool = allowed.length > 0 ? allowed : rest

  let second
  if (strengths && minCount >= ADAPTIVE_MIN_APPEARANCES) {
    const gap = (id) => Math.abs(Math.log(strengths.get(id) / strengths.get(first)))
    const closest = [...pool].sort((a, b) => gap(a) - gap(b)).slice(0, ADAPTIVE_CANDIDATES)
    second = pickRandom(closest, random)
  } else {
    // Second idol also comes from the least-seen, so appearances stay level.
    const poolMin = Math.min(...pool.map((id) => counts.get(id)))
    second = pickRandom(
      pool.filter((id) => counts.get(id) === poolMin),
      random,
    )
  }

  return random() < 0.5 ? [first, second] : [second, first]
}
