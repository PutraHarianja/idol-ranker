<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolCard from './IdolCard.vue'
import AppIcon from './AppIcon.vue'

const store = useRankingStore()
defineEmits(['show-results'])

// A sparkle sticker stamps over the side that was just picked (visual only).
const stamp = ref(null)
let stampId = 0
function pick(side) {
  store.pick(side)
  stamp.value = { id: ++stampId, side }
}

// ← picks left, → picks right, ↓ or S skips (R2).
function onKeydown(e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (e.key === 'ArrowLeft') pick('left')
  else if (e.key === 'ArrowRight') pick('right')
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') store.skip()
  else return
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const pairKey = computed(() => store.pair?.map((idol) => idol.id).join('|'))
const milestone = computed(() => {
  const ratio = store.decisions / store.target
  if (ratio >= 1) return 'Extra picks make it even sharper'
  if (ratio >= 0.85) return 'Almost done'
  if (ratio >= 0.5) return 'Halfway there'
  return 'Tap the one you like more'
})
</script>

<template>
  <section class="compare">
    <h2 class="headline">Who's your pick?</h2>

    <div class="progress" aria-live="polite">
      <div class="progress__label">
        <span>{{ milestone }}</span>
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
      <span class="ready__text">
        <AppIcon name="sparkle" :size="20" class="ready__icon" />
        Your ranking is ready
      </span>
      <button type="button" class="cta" @click="$emit('show-results')">See my ranking</button>
    </div>

    <div v-if="store.pair" class="stage">
      <div :key="pairKey" class="pair">
        <IdolCard :idol="store.pair[0]" side="left" key-hint="←" @pick="pick('left')" />
        <IdolCard :idol="store.pair[1]" side="right" key-hint="→" @pick="pick('right')" />
      </div>
      <span
        v-if="stamp"
        :key="stamp.id"
        class="stamp"
        :class="`stamp--${stamp.side}`"
        aria-hidden="true"
        @animationend="stamp = null"
      >
        <AppIcon name="sparkle" :size="56" />
      </span>
    </div>

    <div class="controls">
      <button type="button" class="control" aria-keyshortcuts="S" @click="store.skip()">
        Both are cute <kbd aria-hidden="true">S</kbd>
      </button>
      <button
        type="button"
        class="control"
        :disabled="store.comparisons.length === 0"
        @click="store.undo()"
      >
        <AppIcon name="undo" :size="16" />
        Undo
      </button>
    </div>
  </section>
</template>

<style scoped>
.compare {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.headline {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 7vw, 2.4rem);
  font-weight: 400;
  line-height: 1.05;
}
.progress__label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.45rem;
  font-size: 0.9rem;
  font-weight: 600;
}
.progress__count {
  font-variant-numeric: tabular-nums;
}
.progress__track {
  height: 10px;
  border-radius: 999px;
  background: var(--surface);
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
  gap: 0.5rem 0.75rem;
  padding: 0.7rem 0.7rem 0.7rem 1rem;
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow);
  font-weight: 700;
}
.ready__text {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.ready__icon {
  color: var(--accent);
}
.cta {
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: var(--accent);
  color: var(--on-accent);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.cta:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
/* Capped so both cards and the controls fit on one desktop screen. */
.stage {
  position: relative;
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  padding-top: 8px;
}
.pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  animation: pair-in 0.22s ease-out;
}
@keyframes pair-in {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
/* Stamps on the card's top corner, like a sticker on a photocard sleeve, never over a face. */
.stamp {
  position: absolute;
  top: -14px;
  z-index: 2;
  color: var(--accent);
  filter: drop-shadow(0 2px 0 var(--text));
  pointer-events: none;
  animation: stamp 0.55s ease-out forwards;
}
.stamp--left {
  right: calc(50% + 0.1rem);
}
.stamp--right {
  right: -0.9rem;
}
@keyframes stamp {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-25deg);
  }
  35% {
    opacity: 1;
    transform: scale(1.15) rotate(8deg);
  }
  60% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: scale(1) rotate(0deg);
  }
}
.controls {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.25rem;
}
.control {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.control:hover:not(:disabled) {
  transform: translateY(-1px);
}
.control:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
.control:disabled {
  opacity: 0.45;
  cursor: default;
}
.control kbd {
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
    gap: 0.75rem;
  }
  .stamp :deep(svg) {
    width: 42px;
    height: 42px;
  }
  .stamp--right {
    right: -0.5rem;
  }
}
@media (hover: none) {
  .control kbd {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .progress__fill {
    transition: none;
  }
  .pair {
    animation: none;
  }
  .stamp {
    display: none;
  }
}
</style>
