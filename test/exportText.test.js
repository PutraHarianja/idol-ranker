import { describe, it, expect } from 'vitest'
import { formatRankingText } from '../src/ranking/exportText.js'

const url = 'https://example.com/idol-ranker/'
const ranking = [
  { rank: 1, score: 81, idol: { name: 'Joy', group: 'Red Velvet' } },
  { rank: 1, score: 81, idol: { name: 'Karina', group: 'aespa' } },
  { rank: 3, score: 40, idol: { name: 'Rosé', group: 'BLACKPINK' } },
]

describe('formatRankingText (P1-5)', () => {
  it('lists rank, name, group and score, one per line', () => {
    expect(formatRankingText(ranking, { decisions: 27, provisional: false, url })).toBe(
      [
        '👑 My Idol Ranking (27 picks)',
        '1. Joy (Red Velvet) — 81',
        '1. Karina (aespa) — 81',
        '3. Rosé (BLACKPINK) — 40',
        '',
        'Rank yours: https://example.com/idol-ranker/',
      ].join('\n'),
    )
  })

  it('lists only the top 5', () => {
    const long = Array.from({ length: 18 }, (_, i) => ({
      rank: i + 1,
      score: 90 - i,
      idol: { name: `Idol ${i + 1}`, group: 'G' },
    }))
    const lines = formatRankingText(long, { decisions: 27, provisional: false, url }).split('\n')
    expect(lines).toHaveLength(1 + 5 + 2)
    expect(lines[5]).toBe('5. Idol 5 (G) — 86')
    expect(lines.at(-1)).toBe('Rank yours: https://example.com/idol-ranker/')
  })

  it('marks a provisional ranking and uses singular "pick"', () => {
    const text = formatRankingText(ranking.slice(0, 1), { decisions: 1, provisional: true, url })
    expect(text.split('\n')[0]).toBe('👑 My Idol Ranking (1 pick, provisional)')
  })
})
