import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readAppVersion, appVersionMetas } from './appVersion.js'

const appVersion = readAppVersion()

// Served from https://putraharianja.github.io/idol-ranker/ on GitHub Pages.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/idol-ranker/' : '/',
  define: { __APP_VERSION__: JSON.stringify(appVersion) },
  plugins: [
    vue(),
    { name: 'app-version-metas', transformIndexHtml: () => appVersionMetas(appVersion) },
  ],
  test: {
    environment: 'node',
  },
}))
