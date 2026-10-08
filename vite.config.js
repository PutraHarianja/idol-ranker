import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Served from https://putraharianja.github.io/idol-ranker/ on GitHub Pages.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/idol-ranker/' : '/',
  plugins: [vue()],
  test: {
    environment: 'node',
  },
}))
