import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decodePhotos, preloadAllWhenIdle, preloadPhotos } from '@/browser/preloadPhotos.js'

const idol = (name, extra = {}) => ({ image: { src: `/idols/${name}.webp`, ...extra } })

let created
beforeEach(() => {
  created = []
  vi.stubGlobal(
    'Image',
    class {
      constructor() {
        created.push(this)
        this.decode = vi.fn(() => Promise.resolve())
      }
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('preloadPhotos', () => {
  it('requests each photo once, under the base path', () => {
    preloadPhotos([idol('a-once'), idol('a-once'), { name: 'No photo' }], '/base/')
    expect(created).toHaveLength(1)
    expect(created[0].src).toBe('/base/idols/a-once.webp')
    preloadPhotos([idol('a-once')], '/base/')
    expect(created).toHaveLength(1)
  })
})

describe('decodePhotos', () => {
  it('waits for every photo to decode, reusing the preloaded image', async () => {
    preloadPhotos([idol('b-one')], '/')
    const pending = decodePhotos([idol('b-one'), idol('b-two')], '/')
    expect(created).toHaveLength(2)
    await pending
    expect(created[0].decode).toHaveBeenCalledOnce()
    expect(created[1].decode).toHaveBeenCalledOnce()
  })

  it('resolves even when a photo fails to decode', async () => {
    decodePhotos([idol('c-bad')], '/')
    created[0].decode = vi.fn(() => Promise.reject(new Error('broken')))
    await expect(decodePhotos([idol('c-bad')], '/')).resolves.toBeUndefined()
  })

  it('resolves with no photos', async () => {
    await expect(decodePhotos([{ name: 'No photo' }], '/')).resolves.toBeUndefined()
  })
})

describe('preloadAllWhenIdle', () => {
  it('waits for an idle moment before loading', () => {
    let idle
    vi.stubGlobal('window', { requestIdleCallback: (fn) => (idle = fn) })
    preloadAllWhenIdle([idol('d-idle')], '/')
    expect(created).toHaveLength(0)
    idle()
    expect(created).toHaveLength(1)
  })
})
