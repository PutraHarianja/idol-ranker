import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  shareApp,
  canShareFiles,
  shareStory,
  APP_URL,
  SHARE_TITLE,
  SHARE_TEXT,
  STORY_FILE_NAME,
} from '@/browser/share.js'

const abort = () => Object.assign(new Error('cancelled'), { name: 'AbortError' })

function stub({ share, writeText, canShare } = {}) {
  const nav = {}
  if (share) nav.share = share
  if (canShare) nav.canShare = canShare
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

describe('Share to Story (P1-9)', () => {
  const file = new File(['jpeg'], STORY_FILE_NAME, { type: 'image/jpeg' })

  describe('canShareFiles', () => {
    it('is true where the share sheet takes an image file', () => {
      const canShare = vi.fn().mockReturnValue(true)
      stub({ canShare })
      expect(canShareFiles()).toBe(true)
      const [{ files }] = canShare.mock.calls[0]
      expect(files[0]).toBeInstanceOf(File)
      expect(files[0].type).toBe('image/jpeg')
    })

    it('is false where files are refused (button hidden)', () => {
      stub({ canShare: vi.fn().mockReturnValue(false) })
      expect(canShareFiles()).toBe(false)
    })

    it('is false without canShare (most desktops)', () => {
      stub({ share: vi.fn() })
      expect(canShareFiles()).toBe(false)
    })

    it('is false when canShare throws', () => {
      stub({
        canShare: () => {
          throw new TypeError('bad')
        },
      })
      expect(canShareFiles()).toBe(false)
    })
  })

  describe('loadStoryFile', () => {
    // Fresh module each time: the loaded file is kept between calls.
    async function load() {
      vi.resetModules()
      return (await import('@/browser/share.js')).loadStoryFile
    }

    it('fetches the image once and returns it as a JPEG File', async () => {
      const fetch = vi.fn().mockResolvedValue(new Response(new Blob(['jpeg'])))
      vi.stubGlobal('fetch', fetch)
      const loadStoryFile = await load()
      const loaded = await loadStoryFile('/idol-ranker/story.jpg')
      expect(loaded).toBeInstanceOf(File)
      expect(loaded.name).toBe(STORY_FILE_NAME)
      expect(loaded.type).toBe('image/jpeg')
      expect(await loadStoryFile('/idol-ranker/story.jpg')).toBe(loaded)
      expect(fetch).toHaveBeenCalledTimes(1)
      expect(fetch).toHaveBeenCalledWith('/idol-ranker/story.jpg')
    })

    it('returns null on a network error, and tries again next time', async () => {
      const fetch = vi.fn().mockRejectedValueOnce(new TypeError('offline'))
      fetch.mockResolvedValueOnce(new Response(new Blob(['jpeg'])))
      vi.stubGlobal('fetch', fetch)
      const loadStoryFile = await load()
      expect(await loadStoryFile('story.jpg')).toBeNull()
      expect(await loadStoryFile('story.jpg')).toBeInstanceOf(File)
    })

    it('returns null on an HTTP error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })))
      const loadStoryFile = await load()
      expect(await loadStoryFile('story.jpg')).toBeNull()
    })
  })

  describe('shareStory', () => {
    it('copies the link and shares the image with the P1-7 text, no url', async () => {
      const share = vi.fn().mockResolvedValue()
      const writeText = vi.fn().mockResolvedValue()
      const onCopy = vi.fn()
      stub({ share, writeText })
      expect(await shareStory(file, onCopy)).toEqual({ status: 'shared', copied: true })
      expect(writeText).toHaveBeenCalledWith(APP_URL)
      expect(share).toHaveBeenCalledWith({ files: [file], title: SHARE_TITLE, text: SHARE_TEXT })
      expect(share.mock.calls[0][0]).not.toHaveProperty('url')
      expect(onCopy).toHaveBeenCalledWith(true)
    })

    it('starts the copy before the share, in the same task (one gesture)', async () => {
      const order = []
      stub({
        writeText: vi.fn(() => (order.push('copy'), Promise.resolve())),
        share: vi.fn(() => (order.push('share'), Promise.resolve())),
      })
      const done = shareStory(file)
      expect(order).toEqual(['copy', 'share'])
      await done
    })

    it('still shares when the copy is refused, and reports copied: false', async () => {
      const share = vi.fn().mockResolvedValue()
      const onCopy = vi.fn()
      stub({ share, writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) })
      expect(await shareStory(file, onCopy)).toEqual({ status: 'shared', copied: false })
      expect(share).toHaveBeenCalled()
      expect(onCopy).toHaveBeenCalledWith(false)
    })

    it('reports copied: false when the clipboard API is missing', async () => {
      stub({ share: vi.fn().mockResolvedValue() })
      expect(await shareStory(file)).toEqual({ status: 'shared', copied: false })
    })

    it('returns cancelled when the sheet is closed', async () => {
      stub({ share: vi.fn().mockRejectedValue(abort()), writeText: vi.fn().mockResolvedValue() })
      expect(await shareStory(file)).toEqual({ status: 'cancelled', copied: true })
    })

    it('returns failed on any other share error', async () => {
      stub({
        share: vi.fn().mockRejectedValue(new Error('NotAllowedError')),
        writeText: vi.fn().mockResolvedValue(),
      })
      expect(await shareStory(file)).toEqual({ status: 'failed', copied: true })
    })

    it('returns failed when share throws synchronously', async () => {
      stub({
        share: () => {
          throw new TypeError('bad data')
        },
      })
      expect(await shareStory(file)).toEqual({ status: 'failed', copied: false })
    })

    it('runs onCopy before it resolves, so a cancel can clear the hint after it', async () => {
      const calls = []
      stub({ share: vi.fn().mockRejectedValue(abort()), writeText: vi.fn().mockResolvedValue() })
      await shareStory(file, () => calls.push('onCopy'))
      calls.push('resolved')
      expect(calls).toEqual(['onCopy', 'resolved'])
    })
  })
})
