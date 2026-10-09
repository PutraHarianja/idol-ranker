import { describe, it, expect } from 'vitest'
import { readAppVersion, appVersionMetas } from '../appVersion.js'
import pkg from '../package.json'

describe('app version (#30)', () => {
  it('uses the package.json version', () => {
    expect(readAppVersion()).toEqual({ version: pkg.version })
  })

  it('builds the app-version meta tag', () => {
    expect(appVersionMetas({ version: '1.1.1' })).toEqual([
      { tag: 'meta', attrs: { name: 'app-version', content: '1.1.1' } },
    ])
  })
})
