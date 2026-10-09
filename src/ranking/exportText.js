// Plain-text ranking for copying to the clipboard (P1-5). Pure JS — no Vue imports.

const TOP_N = 5 // only the top of the list is copied

/**
 * @param {{ rank: number, score: number, idol: { name: string, group: string } }[]} ranking
 * @param {{ decisions: number, provisional: boolean, url: string }} meta
 */
export function formatRankingText(ranking, { decisions, provisional, url }) {
  const header = `👑 My Idol Ranking (${decisions} ${decisions === 1 ? 'pick' : 'picks'}${provisional ? ', provisional' : ''})`
  const lines = ranking.slice(0, TOP_N).map(
    ({ rank, score, idol }) => `${rank}. ${idol.name} (${idol.group}) — ${score}`,
  )
  return [header, ...lines, '', `Rank yours: ${url}`].join('\n')
}
