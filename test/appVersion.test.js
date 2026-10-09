import { describe, it, expect } from 'vitest'
import { readAppVersion, appVersionMetas } from '../appVersion.js'
import pkg from '../package.json'

describe('app version (#30)', () => {
  it('uses package.json version and the short GITHUB_SHA', () => {
    expect(readAppVersion({ GITHUB_SHA: 'abcdef0123456789' })).toEqual({
      version: pkg.version,
      commit: 'abcdef0',
    })
  })

  it('falls back to a non-empty commit without GITHUB_SHA', () => {
    expect(readAppVersion({}).commit).toMatch(/^[0-9a-f]{7,}$|^dev$/)
  })

  it('builds the two meta tags', () => {
    expect(appVersionMetas({ version: '1.1.1', commit: 'abc1234' })).toEqual([
      { tag: 'meta', attrs: { name: 'app-version', content: '1.1.1' } },
      { tag: 'meta', attrs: { name: 'app-commit', content: 'abc1234' } },
    ])
  })
})
