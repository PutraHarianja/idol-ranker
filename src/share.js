// Share the app link (P1-7). Pure JS — no Vue imports, and nothing from the user's picks.

export const APP_URL = 'https://putraharianja.github.io/idol-ranker/'
export const SHARE_TITLE = 'Idol Ranker'
// #50: name, tagline, blank line, link alone on the last line. The link lives in `text`, not `url`,
// so apps can't glue it to the sentence (#51) or send it twice.
export const SHARE_TEXT = `✦ Idol Ranker
Rank the goddesses! Pick your favorite of two, again and again.

${APP_URL}`

/**
 * Call from a click handler (the share sheet needs a user gesture). Never throws.
 * @returns {Promise<'shared' | 'cancelled' | 'copied' | 'manual'>} 'manual' = copy failed; show APP_URL as text.
 */
export async function shareApp() {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      // any other failure falls through to copy
    }
  }
  try {
    await navigator.clipboard.writeText(APP_URL)
    return 'copied'
  } catch {
    return 'manual'
  }
}
