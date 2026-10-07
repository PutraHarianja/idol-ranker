import { describe, it, expect } from 'vitest'
import { getIdols } from '../src/data/idols.js'

describe('getIdols (R1)', () => {
  it('holds 18 idols: 3 from each of 6 groups', () => {
    const idols = getIdols()
    expect(idols).toHaveLength(18)

    const perGroup = {}
    for (const { group } of idols) perGroup[group] = (perGroup[group] ?? 0) + 1
    expect(Object.keys(perGroup)).toHaveLength(6)
    expect(Object.values(perGroup).every((n) => n === 3)).toBe(true)
  })

  it('has unique ids', () => {
    const ids = getIdols().map((idol) => idol.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every idol an id, name and group', () => {
    for (const idol of getIdols()) {
      expect(idol.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)+$/)
      expect(idol.name).toBeTruthy()
      expect(idol.group).toBeTruthy()
    }
  })

  it('returns copies, so callers cannot mutate the dataset', () => {
    getIdols()[0].name = 'changed'
    expect(getIdols()[0].name).not.toBe('changed')
  })
})
