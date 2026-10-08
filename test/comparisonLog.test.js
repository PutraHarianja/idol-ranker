import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  loadComparisons,
  saveComparisons,
  clearComparisons,
  storageKey,
} from '../src/persistence/comparisonLog.js'

function fakeStorage(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
    removeItem: (k) => {
      delete data[k]
    },
  }
}

const throwingStorage = {
  getItem() {
    throw new Error('blocked')
  },
  setItem() {
    throw new Error('quota')
  },
  removeItem() {
    throw new Error('blocked')
  },
}

const KEY = 'idol-ranker:v1:default'
const entry = { winnerId: 'a', loserId: 'b', timestamp: 1 }

describe('comparison log persistence (R8)', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses the key idol-ranker:v1:<poolId>', () => {
    expect(storageKey()).toBe(KEY)
    expect(storageKey('kpop')).toBe('idol-ranker:v1:kpop')
  })

  it('round-trips the log with a schema version', () => {
    const storage = fakeStorage()
    expect(saveComparisons([entry], { storage })).toBe(true)
    expect(JSON.parse(storage.data[KEY])).toEqual({ version: 1, comparisons: [entry] })
    expect(loadComparisons({ storage })).toEqual([entry])
  })

  it.each([
    ['missing', {}],
    ['unparsable JSON', { [KEY]: '{not json' }],
    ['a different version', { [KEY]: JSON.stringify({ version: 2, comparisons: [entry] }) }],
    ['comparisons not an array', { [KEY]: JSON.stringify({ version: 1, comparisons: 'x' }) }],
    ['null', { [KEY]: 'null' }],
  ])('starts fresh when data is %s', (_, initial) => {
    expect(loadComparisons({ storage: fakeStorage(initial) })).toEqual([])
  })

  it('keeps tie entries and old entries without an outcome, drops unknown outcomes (P1-3)', () => {
    const tie = { winnerId: 'a', loserId: 'b', timestamp: 2, outcome: 'tie' }
    const odd = { winnerId: 'a', loserId: 'b', timestamp: 3, outcome: 'draw' }
    const storage = fakeStorage({
      [KEY]: JSON.stringify({ version: 1, comparisons: [entry, tie, odd] }),
    })
    expect(loadComparisons({ storage })).toEqual([entry, tie])
  })

  it('drops malformed entries but keeps valid ones', () => {
    const comparisons = [entry, null, { winnerId: 1, loserId: 'b' }, { winnerId: 'a' }, 'x']
    const storage = fakeStorage({ [KEY]: JSON.stringify({ version: 1, comparisons }) })
    expect(loadComparisons({ storage })).toEqual([entry])
  })

  it('never throws when storage access fails', () => {
    expect(loadComparisons({ storage: throwingStorage })).toEqual([])
    expect(saveComparisons([entry], { storage: throwingStorage })).toBe(false)
    expect(clearComparisons({ storage: throwingStorage })).toBe(false)
  })

  it('never throws when reading localStorage itself throws', () => {
    vi.stubGlobal('localStorage', undefined)
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError')
      },
    })
    expect(loadComparisons()).toEqual([])
    expect(saveComparisons([entry])).toBe(false)
    expect(clearComparisons()).toBe(false)
  })

  it('clears the saved log', () => {
    const storage = fakeStorage()
    saveComparisons([entry], { storage })
    expect(clearComparisons({ storage })).toBe(true)
    expect(loadComparisons({ storage })).toEqual([])
  })
})
