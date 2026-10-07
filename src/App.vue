<script setup>
import { ref } from 'vue'
import ComparisonView from './components/ComparisonView.vue'
import ResultsView from './components/ResultsView.vue'
import CreditsView from './components/CreditsView.vue'

const view = ref('compare')
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">👑 Idol Ranker</h1>
      <nav class="tabs">
        <button
          type="button"
          :class="{ active: view === 'compare' }"
          :aria-current="view === 'compare' ? 'page' : undefined"
          @click="view = 'compare'"
        >
          Compare
        </button>
        <button
          type="button"
          :class="{ active: view === 'results' }"
          :aria-current="view === 'results' ? 'page' : undefined"
          @click="view = 'results'"
        >
          Results
        </button>
      </nav>
    </header>

    <main>
      <ComparisonView v-if="view === 'compare'" @show-results="view = 'results'" />
      <ResultsView v-else-if="view === 'results'" @back="view = 'compare'" />
      <CreditsView v-else @back="view = 'compare'" />
    </main>

    <footer class="footer">
      Photos from Wikimedia Commons ·
      <button type="button" class="link" @click="view = 'credits'">Photo credits</button>
    </footer>
  </div>
</template>

<style>
:root {
  --bg: #faf8fc;
  --surface: #ffffff;
  --text: #1f1a24;
  --muted: #6b6372;
  --border: #e4dfe9;
  --accent: #b5179e;
  --accent-soft: #f8e1f4;
  --warn-soft: #fff4d6;
  --warn-text: #6b4e00;
  --danger: #c92a2a;
  --radius: 10px;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #141118;
    --surface: #1e1a23;
    --text: #f1edf5;
    --muted: #a59dae;
    --border: #342e3b;
    --accent: #e05dc9;
    --accent-soft: #3a1f36;
    --warn-soft: #3a2f12;
    --warn-text: #f5d98b;
    --danger: #ff6b6b;
    color-scheme: dark;
  }
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    sans-serif;
  line-height: 1.4;
}
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem 16px 2rem;
}
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}
.title {
  margin: 0;
  font-size: 1.4rem;
}
.tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.2rem;
  border-radius: 999px;
  background: var(--border);
}
.tabs button {
  padding: 0.35rem 0.9rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}
.tabs button.active {
  background: var(--surface);
  font-weight: 600;
}
.footer {
  margin-top: 2rem;
  color: var(--muted);
  font-size: 0.8rem;
  text-align: center;
}
.footer .link {
  font-size: inherit;
  font-weight: 400;
}
.link {
  border: none;
  background: none;
  color: var(--accent);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
</style>
