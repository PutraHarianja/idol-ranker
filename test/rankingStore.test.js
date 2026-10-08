import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRankingStore } from '../src/stores/ranking.js'

const KEY = 'idol-ranker:v1:default'

function stubStorage(initial = {}) {
  const data = { ...initial }
  vi.stubGlobal('localStorage', {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => {
      delete data[k]
    },
  })
  return data
}

describe('ranking store', () => {
  beforeEach(() => setActivePinia(createPinia()))
  afterEach(() => vi.unstubAllGlobals())

  it('starts with a pair of two different idols and no decisions', () => {
    stubStorage()
    const store = useRankingStore()
    expect(store.pair).toHaveLength(2)
    expect(store.pair[0].id).not.toBe(store.pair[1].id)
    expect(store.decisions).toBe(0)
    expect(store.target).toBe(27)
    expect(store.isProvisional).toBe(true)
  })

  it('records the picked side as the winner and saves after each pick', () => {
    const data = stubStorage()
    const store = useRankingStore()
    const [left, right] = store.pair.map((idol) => idol.id)
    store.pick('right')
    expect(store.comparisons.at(-1)).toMatchObject({ winnerId: right, loserId: left })
    expect(store.decisions).toBe(1)
    expect(JSON.parse(data[KEY]).comparisons).toHaveLength(1)
  })

  it('skip records nothing but changes the pair (R4)', () => {
    stubStorage()
    const store = useRankingStore()
    const before = store.pair.map((idol) => idol.id)
    store.skip()
    const after = store.pair.map((idol) => idol.id)
    expect(store.decisions).toBe(0)
    expect(after.includes(before[0]) && after.includes(before[1])).toBe(false)
  })

  it('restores progress from storage and ignores unknown idols in the count', () => {
    const comparisons = [
      { winnerId: 'aespa-karina', loserId: 'ive-rei', timestamp: 1 },
      { winnerId: 'ghost', loserId: 'ive-rei', timestamp: 2 },
    ]
    stubStorage({ [KEY]: JSON.stringify({ version: 1, comparisons }) })
    const store = useRankingStore()
    expect(store.decisions).toBe(1)
    expect(store.ranking[0].id).toBe('aespa-karina')
  })

  it('becomes ready at the target and the ranking follows the picks', () => {
    stubStorage()
    const store = useRankingStore()
    // Always pick whichever idol comes first alphabetically, so the order is known.
    for (let i = 0; i < 27; i++) {
      const [left, right] = store.pair.map((idol) => idol.id)
      store.pick(left < right ? 'left' : 'right')
    }
    expect(store.isReady).toBe(true)
    expect(store.isProvisional).toBe(false)
    const ids = store.ranking.map((r) => r.id)
    expect(ids[0] < ids.at(-1)).toBe(true)
  })

  it('stage moves start → half → almost → ready at 50%, 85% and the target', () => {
    stubStorage()
    const store = useRankingStore()
    const stageAfter = {}
    for (let i = 1; i <= 27; i++) {
      store.pick('left')
      stageAfter[i] = store.stage
    }
    expect(stageAfter[13]).toBe('start')
    expect(stageAfter[14]).toBe('half')
    expect(stageAfter[22]).toBe('half')
    expect(stageAfter[23]).toBe('almost')
    expect(stageAfter[26]).toBe('almost')
    expect(stageAfter[27]).toBe('ready')
  })

  it('undo removes the last pick, saves, and shows that pair again (P1-1)', () => {
    const data = stubStorage()
    const store = useRankingStore()
    const first = store.pair.map((idol) => idol.id)
    store.pick('left')
    const second = store.pair.map((idol) => idol.id)
    store.pick('right')

    store.undo()
    expect(store.decisions).toBe(1)
    expect(JSON.parse(data[KEY]).comparisons).toHaveLength(1)
    expect(new Set(store.pair.map((idol) => idol.id))).toEqual(new Set(second))

    store.undo()
    expect(store.decisions).toBe(0)
    expect(new Set(store.pair.map((idol) => idol.id))).toEqual(new Set(first))

    store.undo() // nothing left: no-op
    expect(store.decisions).toBe(0)
  })

  it('reset clears the log and storage (R9)', () => {
    const data = stubStorage()
    const store = useRankingStore()
    store.pick('left')
    store.reset()
    expect(store.decisions).toBe(0)
    expect(KEY in data).toBe(false)
    expect(store.pair).toHaveLength(2)
  })

  it('still works when storage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)
    const store = useRankingStore()
    store.pick('left')
    expect(store.decisions).toBe(1)
  })
})
