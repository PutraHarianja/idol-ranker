import { readFileSync } from 'node:fs'

/** Build identity: the version from package.json. */
export function readAppVersion() {
  const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
  return { version }
}

/** Adds <meta name="app-version"> so curl can read the build. */
export function appVersionMetas({ version }) {
  return [{ tag: 'meta', attrs: { name: 'app-version', content: version } }]
}
