// Saves and loads the comparison log (R8). Pure JS — no Vue imports.
// Only the log is stored; scores are always recomputed from it.

export const SCHEMA_VERSION = 1

export function storageKey(poolId = 'default') {
  return `idol-ranker:v${SCHEMA_VERSION}:${poolId}`
}

// Reading `localStorage` itself can throw when storage is blocked, so the lookup is guarded too.
function defaultStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function isComparison(entry) {
  return (
    entry !== null &&
    typeof entry === 'object' &&
    typeof entry.winnerId === 'string' &&
    typeof entry.loserId === 'string' &&
    (entry.outcome === undefined || entry.outcome === 'tie')
  )
}

/** Returns the saved comparisons, or [] if missing, unreadable, or a different version. Never throws. */
export function loadComparisons({ poolId = 'default', storage = defaultStorage() } = {}) {
  try {
    const raw = storage?.getItem(storageKey(poolId))
    if (!raw) return []
    const data = JSON.parse(raw)
    if (data?.version !== SCHEMA_VERSION || !Array.isArray(data.comparisons)) return []
    return data.comparisons.filter(isComparison)
  } catch {
    return []
  }
}

/** Saves the comparisons. Returns false (instead of throwing) if storage is unavailable. */
export function saveComparisons(comparisons, { poolId = 'default', storage = defaultStorage() } = {}) {
  try {
    if (!storage) return false
    storage.setItem(storageKey(poolId), JSON.stringify({ version: SCHEMA_VERSION, comparisons }))
    return true
  } catch {
    return false
  }
}

/** Removes the saved log. Returns false (instead of throwing) if storage is unavailable. */
export function clearComparisons({ poolId = 'default', storage = defaultStorage() } = {}) {
  try {
    if (!storage) return false
    storage.removeItem(storageKey(poolId))
    return true
  } catch {
    return false
  }
}
