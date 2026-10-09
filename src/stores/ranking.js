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
  // Text for the screen-reader live region (F10). Set after every pick, tie and undo.
  const announcement = ref('')

  // Entries for idols no longer in the dataset are kept in storage but don't count (R8).
  const validComparisons = computed(() =>
    comparisons.value.filter(
      (c) => idolsById.has(c.winnerId) && idolsById.has(c.loserId) && c.winnerId !== c.loserId,
    ),
  )
  const decisions = computed(() => validComparisons.value.length)
  const target = comparisonTarget(idolIds.length)
  const isReady = computed(() => decisions.value >= target)
  /** Progress milestone for the UI: 'start' → 'half' (50%) → 'almost' (85%) → 'ready' (target). */
  const stage = computed(() => {
    const ratio = decisions.value / target
    if (ratio >= 1) return 'ready'
    if (ratio >= 0.85) return 'almost'
    if (ratio >= 0.5) return 'half'
    return 'start'
  })
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

  function announce(text) {
    announcement.value = text
  }
  function announceProgress(text) {
    announce(
      decisions.value === target
        ? `${target} picks in! You can see your ranking so far.`
        : `${text} ${decisions.value} of ${target}.`,
    )
  }

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
    announceProgress(`Picked ${idolsById.get(winnerId).name} over ${idolsById.get(loserId).name}.`)
    nextPair()
  }

  /** Records a tie for the current pair (P1-3: half a win each) and loads the next pair. */
  function tie() {
    if (!currentPair.value) return
    const [a, b] = currentPair.value
    comparisons.value = [
      ...comparisons.value,
      { winnerId: a, loserId: b, timestamp: Date.now(), outcome: 'tie' },
    ]
    saveComparisons(comparisons.value)
    announceProgress('Called it a tie.')
    nextPair()
  }

  /** Removes the last pick and shows that pair again (P1-1). Can be repeated. */
  function undo() {
    const last = comparisons.value.at(-1)
    if (!last) return
    comparisons.value = comparisons.value.slice(0, -1)
    saveComparisons(comparisons.value)
    lastPair.value = null
    announce(`Undid your last pick. ${decisions.value} of ${target}.`)
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
    announcement,
    decisions,
    target,
    isReady,
    stage,
    appearances,
    isProvisional,
    ranking,
    pick,
    tie,
    undo,
    reset,
  }
})
