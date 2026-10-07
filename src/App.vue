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
      <h1 class="title"><span class="title__mark" aria-hidden="true" />Idol Ranker</h1>
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
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Unbounded:wght@500;700&display=swap');

:root {
  --bg: #eceef6;
  --surface: #ffffff;
  --text: #1c1b33;
  --muted: #5d5f7e;
  --border: #d9dcea;
  --accent: #c41a5e;
  --accent-soft: #fbe3ec;
  --on-accent: #ffffff;
  --warn-soft: #fff1cc;
  --warn-text: #6b4e00;
  --danger: #c92a2a;
  --radius: 12px;
  --shadow: 0 1px 2px rgb(28 27 51 / 0.06), 0 8px 24px -12px rgb(28 27 51 / 0.25);
  /* Photocard foil: the one decorative flourish, used on card edges and the logo mark. */
  --holo: linear-gradient(
    125deg,
    #ff9ecf 0%,
    #a5b4ff 25%,
    #8ef0e0 50%,
    #fff3a6 75%,
    #ff9ecf 100%
  );
  --font-display: 'Unbounded', 'Arial Black', system-ui, sans-serif;
  --font-body: 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #11111c;
    --surface: #1b1b2a;
    --text: #eeedf9;
    --muted: #9d9fbd;
    --border: #2e2f45;
    --accent: #ff5a92;
    --accent-soft: #3a1a2b;
    --on-accent: #1c0a14;
    --warn-soft: #3a2f12;
    --warn-text: #f5d98b;
    --danger: #ff6b6b;
    --shadow: 0 1px 2px rgb(0 0 0 / 0.4), 0 12px 28px -14px rgb(0 0 0 / 0.8);
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
  font-family: var(--font-body);
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.25rem 16px 2.5rem;
}
.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}
.title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.title__mark {
  width: 0.95rem;
  height: 1.25rem;
  border-radius: 3px;
  background: var(--holo);
  box-shadow: inset 0 0 0 2px var(--surface), 0 0 0 1px var(--border);
  transform: rotate(-8deg);
}
.tabs {
  display: flex;
  gap: 0.2rem;
  padding: 0.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
}
.tabs button {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
/* Full-size touch targets on phones. */
@media (pointer: coarse) {
  .tabs button {
    min-height: 44px;
  }
}
.tabs button:hover {
  color: var(--text);
}
.tabs button.active {
  background: var(--text);
  color: var(--bg);
}
.tabs button:focus-visible,
.link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.footer {
  margin-top: 2.5rem;
  color: var(--muted);
  font-size: 0.8rem;
  text-align: center;
}
.footer .link {
  font-size: inherit;
  font-weight: 500;
}
.link {
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.15em;
  cursor: pointer;
}
</style>
