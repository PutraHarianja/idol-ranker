<script setup>
import { ref, watchEffect } from 'vue'
import { useRankingStore } from './stores/ranking.js'
import ComparisonView from './components/ComparisonView.vue'
import ResultsView from './components/ResultsView.vue'
import CreditsView from './components/CreditsView.vue'
import ShareButton from './components/ShareButton.vue'
import { shareApp, APP_URL } from './share.js'

const store = useRankingStore()
const view = ref('compare')

// 'copied' → chip + polite announcement, 'manual' → link as selectable text; shared/cancelled show nothing.
const shareStatus = ref('')
let shareTimer
// Clears only the announcement this button set, so a pick's announcement is never wiped.
function clearShareNote() {
  clearTimeout(shareTimer)
  shareStatus.value = ''
  if (store.announcement === 'Link copied') store.announcement = ''
}
async function onShare() {
  clearShareNote()
  const result = await shareApp()
  if (result !== 'copied' && result !== 'manual') return
  shareStatus.value = result
  if (result !== 'copied') return
  store.announcement = 'Link copied'
  shareTimer = setTimeout(clearShareNote, 2500)
}

const TITLES = { compare: 'Pick', results: 'My ranking', credits: 'Photo credits' }
watchEffect(() => {
  document.title = `${TITLES[view.value]} · Idol Ranker`
})

// The page background shifts color at progress milestones (start → halfway → almost → ready).
watchEffect(() => {
  document.documentElement.dataset.stage = store.stage
})
</script>

<template>
  <div class="app">
    <header class="header">
      <h1 class="title">
        <svg class="title__mark" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.5 13.9 10l7.6 2-7.6 2L12 21.5 10.1 14l-7.6-2 7.6-2z" />
        </svg>
        Idol Ranker
      </h1>
      <nav class="tabs">
        <button
          type="button"
          :class="{ active: view === 'compare' }"
          :aria-current="view === 'compare' ? 'page' : undefined"
          @click="view = 'compare'"
        >
          Pick
        </button>
        <button
          type="button"
          :class="{ active: view === 'results' }"
          :aria-current="view === 'results' ? 'page' : undefined"
          @click="view = 'results'"
        >
          My ranking
        </button>
      </nav>
      <ShareButton
        :status="shareStatus"
        :url="APP_URL"
        @share="onShare"
        @dismiss="shareStatus = ''"
      />
    </header>

    <div class="live" role="status" aria-live="polite">{{ store.announcement }}</div>

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
/* Self-hosted (latin subset, SIL OFL; licenses in public/fonts). Figtree is a variable font. */
@font-face {
  font-family: 'Dela Gothic One';
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/dela-gothic-one-latin.woff2') format('woff2');
}
@font-face {
  font-family: 'Figtree';
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/figtree-latin.woff2') format('woff2');
}

:root {
  --bg: #d6e4f5;
  --surface: #ffffff;
  --text: #172a55;
  --muted: #4b5b80;
  --border: #b9cbe3;
  --accent: #d92e46;
  --on-accent: #ffffff;
  --accent-soft: #ffffff;
  --tape-1: #f5c542;
  --tape-2: #86d1b0;
  --warn-soft: #fff4d6;
  --warn-text: #6b4e00;
  --danger: #b42318;
  --radius: 12px;
  --shadow: 0 1px 0 rgb(23 42 85 / 0.08), 0 10px 24px -14px rgb(23 42 85 / 0.45);
  --font-display: 'Dela Gothic One', 'Arial Black', system-ui, sans-serif;
  --font-body: 'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif;
  color-scheme: light;
}
:root[data-stage='half'] {
  --bg: #d3ede2;
}
:root[data-stage='almost'] {
  --bg: #f8e9c2;
}
:root[data-stage='ready'] {
  --bg: #f9dce0;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #101b38;
    --surface: #1b2850;
    --text: #eef2fa;
    --muted: #a9b4d0;
    --border: #2f3d68;
    --accent: #ff5a6e;
    --on-accent: #101b38;
    --accent-soft: #1b2850;
    --warn-soft: #3a2f12;
    --warn-text: #f5d98b;
    --danger: #ff8a80;
    --shadow: 0 1px 0 rgb(0 0 0 / 0.3), 0 12px 28px -14px rgb(0 0 0 / 0.8);
    color-scheme: dark;
  }
  :root[data-stage='half'] {
    --bg: #10292a;
  }
  :root[data-stage='almost'] {
    --bg: #2a2414;
  }
  :root[data-stage='ready'] {
    --bg: #33171f;
  }
}
.live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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
  transition: background-color 0.6s ease;
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
  margin-bottom: 1.25rem;
}
.title {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 400;
}
.title__mark {
  width: 1.25rem;
  height: 1.25rem;
  fill: var(--accent);
  stroke: var(--text);
  stroke-width: 1.2;
  stroke-linejoin: round;
}
.tabs {
  display: flex;
  gap: 0.2rem;
  padding: 0.25rem;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow);
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
.tabs button:hover {
  color: var(--text);
}
.tabs button.active {
  background: var(--text);
  color: var(--surface);
}
/* Phones: title and Share share the first row, the tabs get their own row. */
@media (max-width: 559px) {
  .header .tabs {
    order: 3;
  }
  .header .share-note {
    order: 4;
  }
}
@media (pointer: coarse) {
  .tabs button {
    min-height: 44px;
  }
}
.tabs button:focus-visible,
.link:focus-visible {
  outline: 2px solid var(--text);
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
/* Touch screens: grow the tap area to 44px without moving the text. */
@media (pointer: coarse), (max-width: 559px) {
  .footer .link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 0.5rem;
    margin: 0 -0.5rem;
  }
}
.link {
  padding: 0;
  border: none;
  background: none;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  body {
    transition: none;
  }
}
</style>
