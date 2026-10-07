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
      <button type="button" class="cta" @click="$emit('show-results')">See results</button>
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
  gap: 1.25rem;
}
.progress__label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
}
.progress__count {
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.progress__track {
  height: 8px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.progress__fill {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 0.25s ease;
}
.ready {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  background: var(--accent-soft);
  font-weight: 600;
}
.cta {
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.cta:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.pair {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.9rem;
}
.vs {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 700;
}
.controls {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}
.skip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.skip:hover:not(:disabled) {
  border-color: var(--muted);
}
.skip:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.skip:disabled {
  opacity: 0.4;
  cursor: default;
}
.skip kbd {
  padding: 0.05rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--muted);
  font-family: inherit;
  font-size: 0.75rem;
}
/* Cards stay side by side on phones so both are visible without scrolling. */
@media (max-width: 559px) {
  .pair {
    gap: 0.35rem;
  }
  .vs {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.6rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .progress__fill {
    transition: none;
  }
}
</style>
