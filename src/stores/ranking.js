import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getIdols } from '../data/idols.js'
import { fitBradleyTerry } from '../ranking/bradleyTerry.js'
import { selectPair, countAppearances } from '../ranking/pairSelection.js'
import { rankWithScores, comparisonTarget, MIN_APPEARANCES } from '../ranking/score.js'
import { loadComparisons, saveComparisons, clearComparisons } from '../persistence/comparisonLog.js'

export const useRankingStore = defineStore('ranking', () => {
  const idols = getIdols()
  const idolIds = idols.map((idol) => idol.id)
  const idolsById = new Map(idols.map((idol) => [idol.id, idol]))

  const comparisons = ref(loadComparisons())
  const currentPair = ref(null)
  const lastPair = ref(null)

  // Entries for idols no longer in the dataset are kept in storage but don't count (R8).
  const validComparisons = computed(() =>
    comparisons.value.filter(
      (c) => idolsById.has(c.winnerId) && idolsById.has(c.loserId) && c.winnerId !== c.loserId,
    ),
  )
  const decisions = computed(() => validComparisons.value.length)
  const target = comparisonTarget(idolIds.length)
  const isReady = computed(() => decisions.value >= target)
  const appearances = computed(() => countAppearances(idolIds, validComparisons.value))
  const isProvisional = computed(() =>
    [...appearances.value.values()].some((n) => n < MIN_APPEARANCES),
  )

  const ranking = computed(() =>
    rankWithScores(fitBradleyTerry(idolIds, validComparisons.value)).map((entry) => ({
      ...entry,
      idol: idolsById.get(entry.id),
    })),
  )

  const pair = computed(() => currentPair.value?.map((id) => idolsById.get(id)) ?? null)

  function nextPair() {
    lastPair.value = currentPair.value
    const strengths = new Map(ranking.value.map((entry) => [entry.id, entry.strength]))
    currentPair.value = selectPair(idolIds, validComparisons.value, {
      lastPair: lastPair.value,
      strengths,
    })
  }

  /** Records a pick for the idol on `side` ('left' | 'right') and loads the next pair (R2). */
  function pick(side) {
    if (!currentPair.value) return
    const [left, right] = currentPair.value
    const [winnerId, loserId] = side === 'left' ? [left, right] : [right, left]
    comparisons.value = [...comparisons.value, { winnerId, loserId, timestamp: Date.now() }]
    saveComparisons(comparisons.value)
    nextPair()
  }

  /** Loads a new pair without recording anything (R4). */
  function skip() {
    nextPair()
  }

  /** Removes the last pick and shows that pair again (P1-1). Can be repeated. */
  function undo() {
    const last = comparisons.value.at(-1)
    if (!last) return
    comparisons.value = comparisons.value.slice(0, -1)
    saveComparisons(comparisons.value)
    lastPair.value = null
    const { winnerId, loserId } = last
    if (idolsById.has(winnerId) && idolsById.has(loserId)) {
      currentPair.value = Math.random() < 0.5 ? [winnerId, loserId] : [loserId, winnerId]
    } else {
      currentPair.value = selectPair(idolIds, validComparisons.value)
    }
  }

  /** Clears the log and storage (R9). Confirmation is handled by the UI. */
  function reset() {
    comparisons.value = []
    clearComparisons()
    currentPair.value = null
    lastPair.value = null
    nextPair()
  }

  nextPair()

  return {
    idols,
    comparisons,
    pair,
    decisions,
    target,
    isReady,
    appearances,
    isProvisional,
    ranking,
    pick,
    skip,
    undo,
    reset,
  }
})
