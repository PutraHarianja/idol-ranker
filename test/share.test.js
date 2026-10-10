import { describe, it, expect, vi, afterEach } from 'vitest'
import { shareApp, APP_URL, SHARE_TITLE, SHARE_TEXT } from '../src/share.js'

const abort = () => Object.assign(new Error('cancelled'), { name: 'AbortError' })

function stub({ share, writeText } = {}) {
  const nav = {}
  if (share) nav.share = share
  if (writeText) nav.clipboard = { writeText }
  vi.stubGlobal('navigator', nav)
}

afterEach(() => vi.unstubAllGlobals())

describe('shareApp (P1-7)', () => {
  it('shares via the share sheet with exactly the app link', async () => {
    const share = vi.fn().mockResolvedValue()
    const writeText = vi.fn()
    stub({ share, writeText })
    expect(await shareApp()).toBe('shared')
    expect(share).toHaveBeenCalledWith({ title: SHARE_TITLE, text: SHARE_TEXT })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('sends the structured message with the link once, alone on the last line (#50, #51)', async () => {
    const share = vi.fn().mockResolvedValue()
    stub({ share })
    await shareApp()
    const payload = share.mock.calls[0][0]
    expect(payload).toEqual({
      title: 'Idol Ranker',
      text:
        '✦ Idol Ranker\n' +
        'Rank the goddesses! Pick your favorite of two, again and again.\n' +
        '\n' +
        'https://putraharianja.github.io/idol-ranker/',
    })
    expect(payload).not.toHaveProperty('url')
    expect(payload.text.split(APP_URL)).toHaveLength(2)
    expect(payload.text.endsWith(`\n${APP_URL}`)).toBe(true)
  })

  it('returns cancelled when the sheet is closed, without copying', async () => {
    const writeText = vi.fn()
    stub({ share: vi.fn().mockRejectedValue(abort()), writeText })
    expect(await shareApp()).toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies when the share sheet is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue()
    stub({ writeText })
    expect(await shareApp()).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(APP_URL)
  })

  it('copies when share fails with a non-abort error', async () => {
    const writeText = vi.fn().mockResolvedValue()
    stub({ share: vi.fn().mockRejectedValue(new Error('NotAllowedError')), writeText })
    expect(await shareApp()).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(APP_URL)
  })

  it('copies when share throws synchronously', async () => {
    const writeText = vi.fn().mockResolvedValue()
    stub({
      share: () => {
        throw new TypeError('bad data')
      },
      writeText,
    })
    expect(await shareApp()).toBe('copied')
  })

  it('returns manual when copy is blocked', async () => {
    stub({ writeText: vi.fn().mockRejectedValue(new Error('denied')) })
    expect(await shareApp()).toBe('manual')
  })

  it('returns manual when the clipboard API is missing', async () => {
    stub()
    expect(await shareApp()).toBe('manual')
  })

  it('shares only the fixed app URL, never the page location', () => {
    expect(APP_URL).toBe('https://putraharianja.github.io/idol-ranker/')
  })
})
