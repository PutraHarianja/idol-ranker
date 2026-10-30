<script setup>
import { nextTick, ref, watchEffect } from 'vue'
import { useRankingStore } from '@/stores/ranking.js'
import ComparisonView from '@/views/ComparisonView.vue'
import ResultsView from '@/views/ResultsView.vue'
import CreditsView from '@/views/CreditsView.vue'
import ShareButton from '@/components/ShareButton.vue'
import { shareApp, APP_URL } from '@/browser/share.js'
import '@/styles/tokens.css'
import '@/styles/base.css'

const store = useRankingStore()
const view = ref('compare')
const pickTab = ref(null)

// Leaving My ranking unmounts the button that had focus, so land on the Pick tab (#66).
async function backToPick() {
  view.value = 'compare'
  await nextTick()
  pickTab.value?.focus()
}

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
        <span class="title__text"><span>Idol</span> <span>Ranker</span></span>
      </h1>
      <nav class="tabs">
        <button
          ref="pickTab"
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
      <ResultsView v-else-if="view === 'results'" @back="backToPick" />
      <CreditsView v-else @back="view = 'compare'" />
    </main>

    <footer class="footer">
      Photos from Wikimedia Commons ·
      <button type="button" class="link" @click="view = 'credits'">Photo credits</button>
    </footer>
  </div>
</template>
