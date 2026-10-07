<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolCard from './IdolCard.vue'

const store = useRankingStore()
defineEmits(['show-results'])

// ← picks left, → picks right, ↓ or S skips (R2).
function onKeydown(e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (e.key === 'ArrowLeft') store.pick('left')
  else if (e.key === 'ArrowRight') store.pick('right')
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') store.skip()
  else return
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <section class="compare">
    <div class="progress" aria-live="polite">
      <div class="progress__label">
        <span>Who do you prefer?</span>
        <span class="progress__count">{{ store.decisions }} / {{ store.target }}</span>
      </div>
      <div
        class="progress__track"
        role="progressbar"
        :aria-valuenow="Math.min(store.decisions, store.target)"
        aria-valuemin="0"
        :aria-valuemax="store.target"
      >
        <div
          class="progress__fill"
          :style="{ width: `${Math.min(100, (store.decisions / store.target) * 100)}%` }"
        />
      </div>
    </div>

    <div v-if="store.isReady" class="ready">
      <span>🎉 Your ranking is ready!</span>
      <button type="button" class="link" @click="$emit('show-results')">See results</button>
    </div>

    <div v-if="store.pair" class="pair">
      <IdolCard :idol="store.pair[0]" key-hint="←" @pick="store.pick('left')" />
      <span class="vs" aria-hidden="true">vs</span>
      <IdolCard :idol="store.pair[1]" key-hint="→" @pick="store.pick('right')" />
    </div>

    <div class="controls">
      <button type="button" class="skip" @click="store.skip()">
        Can't decide <kbd>S</kbd>
      </button>
      <button
        type="button"
        class="skip"
        :disabled="store.comparisons.length === 0"
        @click="store.undo()"
      >
        ↶ Undo
      </button>
    </div>
  </section>
</template>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.progress__label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  font-weight: 600;
}
.progress__count {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.progress__track {
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.2s ease;
}
.ready {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--accent-soft);
  font-weight: 600;
}
.pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.75rem;
}
.vs {
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
.skip:disabled {
  opacity: 0.4;
  cursor: default;
}
.skip {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: transparent;
  color: var(--text);
  font: inherit;
  cursor: pointer;
}
.skip kbd {
  margin-left: 0.3rem;
  color: var(--muted);
  font-size: 0.8rem;
}
/* Cards stay side by side on phones so both are visible without scrolling. */
@media (max-width: 559px) {
  .pair {
    gap: 0.4rem;
  }
  .vs {
    font-size: 0.75rem;
  }
}
</style>
