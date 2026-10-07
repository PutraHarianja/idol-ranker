import { describe, it, expect } from 'vitest'
import { selectPair, countAppearances } from '../src/ranking/pairSelection.js'
import { seededRandom } from './helpers.js'

const ids18 = Array.from({ length: 18 }, (_, i) => `idol-${i}`)
const samePair = (p, q) => p.includes(q[0]) && p.includes(q[1])

// Runs `decisions` picks (left always wins — the winner doesn't affect coverage).
function runSession(ids, decisions, random) {
  const log = []
  let lastPair = null
  for (let k = 0; k < decisions; k++) {
    const pair = selectPair(ids, log, { lastPair, random })
    log.push({ winnerId: pair[0], loserId: pair[1], timestamp: 0 })
    lastPair = pair
  }
  return log
}

describe('selectPair (R2, R3)', () => {
  it('always returns two different idols', () => {
    const random = seededRandom(1)
    for (let k = 0; k < 1000; k++) {
      const [a, b] = selectPair(ids18, [], { random })
      expect(a).not.toBe(b)
    }
  })

  it('never repeats the last pair, in either order', () => {
    const random = seededRandom(2)
    const log = []
    let lastPair = null
    for (let k = 0; k < 2000; k++) {
      const pair = selectPair(ids18, log, { lastPair, random })
      if (lastPair) expect(samePair(pair, lastPair)).toBe(false)
      // Skip half the time: skipped pairs aren't logged but still count as "last".
      if (random() < 0.5) log.push({ winnerId: pair[0], loserId: pair[1], timestamp: 0 })
      lastPair = pair
    }
  })

  it('includes an idol with the fewest appearances', () => {
    const random = seededRandom(3)
    const log = runSession(ids18, 10, random)
    const counts = countAppearances(ids18, log)
    const min = Math.min(...counts.values())
    for (let k = 0; k < 200; k++) {
      const pair = selectPair(ids18, log, { random })
      expect(pair.some((id) => counts.get(id) === min)).toBe(true)
    }
  })

  it('randomizes left/right placement', () => {
    const random = seededRandom(4)
    const leftCount = new Map(ids18.map((id) => [id, 0]))
    const total = new Map(ids18.map((id) => [id, 0]))
    for (let k = 0; k < 20000; k++) {
      const [left, right] = selectPair(ids18, [], { random })
      leftCount.set(left, leftCount.get(left) + 1)
      total.set(left, total.get(left) + 1)
      total.set(right, total.get(right) + 1)
    }
    for (const id of ids18) {
      const share = leftCount.get(id) / total.get(id)
      expect(share).toBeGreaterThan(0.45)
      expect(share).toBeLessThan(0.55)
    }
  })

  it('shows every idol exactly 3 times after 27 decisions with no skips (1,000 sessions)', () => {
    const random = seededRandom(5)
    for (let run = 0; run < 1000; run++) {
      const counts = countAppearances(ids18, runSession(ids18, 27, random))
      expect([...counts.values()].every((n) => n === 3)).toBe(true)
    }
  })

  it('shows every idol >= 2 times after 27 decisions even with skips (1,000 sessions)', () => {
    const random = seededRandom(6)
    for (let run = 0; run < 1000; run++) {
      const log = []
      let lastPair = null
      while (log.length < 27) {
        const pair = selectPair(ids18, log, { lastPair, random })
        if (random() >= 0.3) log.push({ winnerId: pair[0], loserId: pair[1], timestamp: 0 })
        lastPair = pair
      }
      const counts = countAppearances(ids18, log)
      expect(Math.min(...counts.values())).toBeGreaterThanOrEqual(2)
    }
  })

  it('works with exactly 2 idols (a repeat is unavoidable)', () => {
    const pair = selectPair(['a', 'b'], [], { lastPair: ['a', 'b'] })
    expect(new Set(pair)).toEqual(new Set(['a', 'b']))
  })

  it('ignores unknown ids in the log when counting appearances', () => {
    const counts = countAppearances(['a', 'b'], [{ winnerId: 'ghost', loserId: 'a' }])
    expect(Object.fromEntries(counts)).toEqual({ a: 1, b: 0 })
  })
})
