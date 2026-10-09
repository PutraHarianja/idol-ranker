import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/** Build identity: version from package.json, short commit from Actions or git, else "dev". */
export function readAppVersion(env = process.env) {
  const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
  let commit = env.GITHUB_SHA?.slice(0, 7)
  if (!commit) {
    try {
      commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .trim()
    } catch {
      /* not a git checkout */
    }
  }
  return { version, commit: commit || 'dev' }
}

/** Adds <meta name="app-version"> and <meta name="app-commit"> so curl can read the build. */
export function appVersionMetas({ version, commit }) {
  return [
    { tag: 'meta', attrs: { name: 'app-version', content: version } },
    { tag: 'meta', attrs: { name: 'app-commit', content: commit } },
  ]
}
