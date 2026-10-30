import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

// Browser globals the app uses, plus the build-time constant from vite.config.js.
// shortcut: hand-listed to avoid the `globals` package, switch to it if this list keeps growing.
const browserGlobals = Object.fromEntries(
  [
    'window',
    'document',
    'navigator',
    'localStorage',
    'setTimeout',
    'clearTimeout',
    'requestAnimationFrame',
    'Image',
    'File',
    '__APP_VERSION__',
  ].map((name) => [name, 'readonly']),
)

// Imports using the `@` alias (src/) need no rule: ESLint does not resolve imports here.
export default [
  { ignores: ['dist', 'public', 'node_modules'] },
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  { languageOptions: { globals: browserGlobals } },
  {
    files: ['vite.config.js', 'appVersion.js', 'test/**/*.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        URL: 'readonly',
      },
    },
  },
  prettier,
]
