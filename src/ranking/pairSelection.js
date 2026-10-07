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

/**
 * Picks the next pair to show.
 * - First idol: random among those with the fewest appearances.
 * - Second idol: random among the least-seen of the rest, avoiding a repeat of `lastPair`
 *   (either order). With no skips, every idol has exactly 3 appearances after 1.5 × N picks.
 * - Left/right order is randomized.
 *
 * @param {string[]} idolIds  at least 2 ids
 * @param {{ winnerId: string, loserId: string }[]} comparisons
 * @param {{ lastPair?: [string, string] | null, random?: () => number }} options
 * @returns {[string, string]} [leftId, rightId]
 */
export function selectPair(idolIds, comparisons, { lastPair = null, random = Math.random } = {}) {
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
  // Second idol also comes from the least-seen, so appearances stay level.
  const poolMin = Math.min(...pool.map((id) => counts.get(id)))
  const second = pickRandom(
    pool.filter((id) => counts.get(id) === poolMin),
    random,
  )

  return random() < 0.5 ? [first, second] : [second, first]
}
