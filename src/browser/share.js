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

// Share to Story (P1-9): the promo image (#61) through the share sheet, with the link copied too.
export const STORY_FILE_NAME = 'idol-ranker-story.jpg'
const STORY_TYPE = 'image/jpeg'

/** True only where the share sheet takes image files (most phones; hidden elsewhere). */
export function canShareFiles() {
  try {
    return !!navigator.canShare?.({
      files: [new File([''], STORY_FILE_NAME, { type: STORY_TYPE })],
    })
  } catch {
    return false
  }
}

let storyFile
/**
 * Fetches the story image once and keeps it, so the tap itself does no network work (the share
 * sheet needs a live user gesture). Never throws.
 * @returns {Promise<File | null>} null = couldn't load; hide the button.
 */
export function loadStoryFile(url) {
  storyFile ??= fetch(url)
    .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((blob) => new File([blob], STORY_FILE_NAME, { type: STORY_TYPE }))
    .catch(() => {
      storyFile = undefined // let a later mount try again
      return null
    })
  return storyFile
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(APP_URL)
    return true
  } catch {
    return false
  }
}

/**
 * Call from a click handler with the File from loadStoryFile(). Starts the copy first, then opens the
 * share sheet in the same task: Chrome's share() uses up the gesture, so a copy after it would fail.
 * `onCopy(copied)` runs as soon as the copy settles, before the result. Never throws.
 * @returns {Promise<{ status: 'shared' | 'cancelled' | 'failed', copied: boolean }>}
 */
export async function shareStory(file, onCopy = () => {}) {
  const copy = copyLink().then((copied) => {
    onCopy(copied)
    return copied
  })
  let status = 'shared'
  try {
    // Link in `text`, never `url`, as in shareApp() (#50, #51).
    await navigator.share({ files: [file], title: SHARE_TITLE, text: SHARE_TEXT })
  } catch (err) {
    status = err?.name === 'AbortError' ? 'cancelled' : 'failed'
  }
  return { status, copied: await copy }
}
