import { describe, it, expect } from 'vitest'
import { selectPair, countAppearances } from '../src/ranking/pairSelection.js'
import { fitBradleyTerry } from '../src/ranking/bradleyTerry.js'
import { seededRandom, kendallTau } from './helpers.js'

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

describe('adaptive pairing (P1-2)', () => {
  // Strengths 1..18, so idol-i's closest neighbours are idol-(i±1), idol-(i±2), ...
  const strengths = new Map(ids18.map((id, i) => [id, i + 1]))
  const everyoneSeen = (times) =>
    ids18.flatMap((id, i) =>
      Array.from({ length: times }, () => ({ winnerId: id, loserId: ids18[(i + 1) % 18] })),
    )

  it('pairs each idol with one of the 3 closest in strength once all have >= 3 appearances', () => {
    const random = seededRandom(7)
    const log = everyoneSeen(2) // every idol appears 4 times
    const gap = (x, y) => Math.abs(Math.log(strengths.get(x) / strengths.get(y)))
    const closest3 = (x) =>
      ids18
        .filter((id) => id !== x)
        .sort((p, q) => gap(p, x) - gap(q, x))
        .slice(0, 3)
    for (let k = 0; k < 500; k++) {
      const [a, b] = selectPair(ids18, log, { strengths, random })
      // Left/right is random, so either idol could have been the "first" one.
      expect(closest3(a).includes(b) || closest3(b).includes(a)).toBe(true)
    }
  })

  it('keeps balanced pairing until every idol has 3 appearances', () => {
    const random = seededRandom(8)
    const log = runSession(ids18, 10, random)
    const counts = countAppearances(ids18, log)
    const min = Math.min(...counts.values())
    for (let k = 0; k < 200; k++) {
      const pair = selectPair(ids18, log, { strengths, random })
      expect(pair.every((id) => counts.get(id) <= min + 1)).toBe(true)
    }
  })

  it('never repeats the last pair in adaptive mode', () => {
    const random = seededRandom(9)
    const log = everyoneSeen(2)
    let lastPair = null
    for (let k = 0; k < 500; k++) {
      const pair = selectPair(ids18, log, { lastPair, strengths, random })
      if (lastPair) expect(samePair(pair, lastPair)).toBe(false)
      lastPair = pair
    }
  })

  // PRD P1-2 acceptance: reaches a given accuracy in fewer comparisons than non-adaptive
  // pairing. Measured as higher mean Kendall tau at the same budget (400 comparisons),
  // averaged over 3 seeds x 20 simulated users. The real gap is ~0.03; picking the second
  // idol at random instead gives ~0.00, so a 0.015 margin catches that regression.
  it('recovers the true order better than balanced pairing (60 simulated users)', () => {
    const trueStrengths = new Map(ids18.map((id, i) => [id, Math.exp(-2 + (4 * i) / 17)]))
    const truth = ids18.map((id) => trueStrengths.get(id))

    function meanTau(adaptive, seed) {
      const random = seededRandom(seed)
      let total = 0
      for (let run = 0; run < 20; run++) {
        const log = []
        let lastPair = null
        while (log.length < 400) {
          const fitted = adaptive
            ? new Map(fitBradleyTerry(ids18, log).map((r) => [r.id, r.strength]))
            : null
          const [a, b] = selectPair(ids18, log, { lastPair, strengths: fitted, random })
          const pA = trueStrengths.get(a) / (trueStrengths.get(a) + trueStrengths.get(b))
          log.push(random() < pA ? { winnerId: a, loserId: b } : { winnerId: b, loserId: a })
          lastPair = [a, b]
        }
        const fit = new Map(fitBradleyTerry(ids18, log).map((r) => [r.id, r.strength]))
        total += kendallTau(truth, ids18.map((id) => fit.get(id)))
      }
      return total / 20
    }

    const seeds = [10, 11, 12]
    const meanGap =
      seeds.reduce((sum, seed) => sum + meanTau(true, seed) - meanTau(false, seed), 0) /
      seeds.length
    expect(meanGap).toBeGreaterThan(0.015)
  })
})
