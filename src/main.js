import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')

// Build identity for checking which build is live (no UI); also in <meta name="app-version"> / "app-commit".
window.__APP_VERSION__ = __APP_VERSION__
