import { describe, it, expect } from 'vitest'
import { goddessScore, rankWithScores, comparisonTarget } from '../src/ranking/score.js'

describe('goddessScore (R6)', () => {
  it('maps strength to a 0–100 integer', () => {
    expect(goddessScore(1)).toBe(50)
    expect(goddessScore(3)).toBe(75)
    expect(goddessScore(1e-9)).toBe(0)
    expect(goddessScore(1e9)).toBe(100)
  })
})

describe('rankWithScores (R6)', () => {
  it('gives equal rounded scores the same rank (1, 1, 3)', () => {
    const ranked = rankWithScores([
      { id: 'a', strength: 3 }, // 75
      { id: 'b', strength: 2.99 }, // 75 after rounding
      { id: 'c', strength: 1 }, // 50
    ])
    expect(ranked.map((r) => [r.id, r.score, r.rank])).toEqual([
      ['a', 75, 1],
      ['b', 75, 1],
      ['c', 50, 3],
    ])
  })

  it('ranks everyone 1st with score 50 for an empty log', () => {
    const ranked = rankWithScores(['a', 'b', 'c'].map((id) => ({ id, strength: 1 })))
    expect(ranked.every((r) => r.rank === 1 && r.score === 50)).toBe(true)
  })
})

describe('comparisonTarget (R7)', () => {
  it('is ⌈1.5 × N⌉', () => {
    expect(comparisonTarget(18)).toBe(27)
    expect(comparisonTarget(5)).toBe(8)
  })
})
