import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { getIdols } from '@/data/idols.js'
import { preloadAllWhenIdle } from '@/browser/preloadPhotos.js'

createApp(App).use(createPinia()).mount('#app')
// The current pair's photos start loading first (ComparisonView); the rest follow when idle (#75).
preloadAllWhenIdle(getIdols())

// Build identity for checking which build is live (no UI); also in <meta name="app-version">.
window.__APP_VERSION__ = __APP_VERSION__
