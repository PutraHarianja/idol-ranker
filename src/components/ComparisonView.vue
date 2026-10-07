<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolCard from './IdolCard.vue'
import AppIcon from './AppIcon.vue'

const store = useRankingStore()
defineEmits(['show-results'])

// Visual only: after a pick or skip, the pair that was just answered stays on top for a beat
// while a sticker stamps onto the chosen card (both cards on a skip), then fades to reveal the
// next pair. The store is updated immediately, exactly as before.
const flash = ref(null)
let flashId = 0
function stampAndRun(side, action) {
  const answered = store.pair
  action()
  if (answered) flash.value = { id: ++flashId, pair: answered, side }
}
const pick = (side) => stampAndRun(side, () => store.pick(side))
const skip = () => stampAndRun('both', () => store.skip())
const stamped = (side) => flash.value && (flash.value.side === side || flash.value.side === 'both')

// ← picks left, → picks right, ↓ or S skips (R2).
function onKeydown(e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (e.key === 'ArrowLeft') pick('left')
  else if (e.key === 'ArrowRight') pick('right')
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') skip()
  else return
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

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
      <div class="pair">
        <IdolCard :idol="store.pair[0]" side="left" key-hint="←" @pick="pick('left')" />
        <IdolCard :idol="store.pair[1]" side="right" key-hint="→" @pick="pick('right')" />
      </div>

      <div
        v-if="flash"
        :key="flash.id"
        class="flash pair"
        aria-hidden="true"
        inert
        @animationend.self="flash = null"
      >
        <div
          v-for="(side, i) in ['left', 'right']"
          :key="side"
          class="flash__slot"
          :class="{ 'flash__slot--chosen': stamped(side) }"
        >
          <IdolCard :idol="flash.pair[i]" :side="side" />
          <span v-if="stamped(side)" class="stamp">
            <AppIcon :name="flash.side === 'both' ? 'heart' : 'sparkle'" :size="64" />
          </span>
        </div>
      </div>
    </div>

    <div class="controls">
      <button type="button" class="control" aria-keyshortcuts="S" @click="skip()">
        I love them both <kbd aria-hidden="true">S</kbd>
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
}

/* The answered pair, held on top of the next pair while the sticker lands, then faded out. */
.flash {
  position: absolute;
  inset: 8px 0 auto;
  z-index: 2;
  pointer-events: none;
  animation: flash-out 1s ease-in forwards;
}
@keyframes flash-out {
  0%,
  65% {
    opacity: 1;
    transform: none;
  }
  100% {
    opacity: 0;
    transform: translateY(-10px) scale(0.98);
  }
}
.flash__slot {
  position: relative;
}
/* Mute the other card without making it see-through (the next pair is underneath). */
.flash__slot:not(.flash__slot--chosen) {
  filter: grayscale(1) brightness(0.9);
}
.flash__slot--chosen {
  animation: thump 0.45s ease-out;
}
@keyframes thump {
  0%,
  15% {
    transform: none;
  }
  25% {
    transform: scale(0.96);
  }
  45% {
    transform: scale(1.02);
  }
  100% {
    transform: none;
  }
}
/* Sticker lands on the card's top corner, never over a face. */
.stamp {
  position: absolute;
  top: -22px;
  right: -16px;
  z-index: 3;
  color: var(--accent);
  filter: drop-shadow(0 3px 0 var(--text));
  animation: stamp 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.2) both;
}
@keyframes stamp {
  0% {
    opacity: 0;
    transform: scale(2.4) rotate(-30deg);
  }
  35% {
    opacity: 1;
    transform: scale(0.85) rotate(8deg);
  }
  60% {
    transform: scale(1.08) rotate(-4deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(-6deg);
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
  .stamp {
    top: -16px;
    right: -10px;
  }
  .stamp :deep(svg) {
    width: 48px;
    height: 48px;
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
  .flash {
    display: none;
  }
}
</style>
