<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolCard from '../components/IdolCard.vue'
import AppIcon from '../components/AppIcon.vue'
import { preloadPhotos } from '../browser/preloadPhotos.js'

const store = useRankingStore()
defineEmits(['show-results'])

// Visual only: after a pick or skip, the pair that was just answered stays on top for a beat
// (a sticker stamps onto the picked card, or one shared sticker across the gap on a tie), then the cards flip over to the
// next pair, like turning photocards. Cards stay opaque, so two faces never blend. The store
// is updated immediately; the flash only delays what the user sees, never what gets recorded.
const HOLD_MS = 500 // sticker lands and holds
const FLIP_MS = 180 // each half of the flip (out, then in)
const STAGGER_MS = 40 // right card trails the left
const FLASH_MS = HOLD_MS + STAGGER_MS + FLIP_MS
const timing = {
  '--hold': `${HOLD_MS}ms`,
  '--flip': `${FLIP_MS}ms`,
  '--stagger': `${STAGGER_MS}ms`,
}

// The store picks the next pair the moment a pick is recorded, while the flash is still showing
// the old one. Start fetching its photos then, so they are ready when the cards flip.
watch(() => store.pair, preloadPhotos, { immediate: true })

const pairEl = ref(null)
const flash = ref(null)
const revealing = ref(false)
let flashId = 0
let flashTimer = 0
let refocusSide = null

function focusedSide() {
  const cards = pairEl.value ? [...pairEl.value.querySelectorAll('.card')] : []
  const i = cards.indexOf(document.activeElement)
  return i === 0 ? 'left' : i === 1 ? 'right' : null
}

// Ends the flash and shows the real pair, flipping it in.
async function endFlash() {
  if (!flash.value) return
  clearTimeout(flashTimer)
  flash.value = null
  revealing.value = false
  const side = refocusSide
  refocusSide = null
  await nextTick()
  requestAnimationFrame(() => (revealing.value = true))
  // Hidden cards lose focus, so put it back on the same side (keyboard users).
  if (side) pairEl.value?.querySelectorAll('.card')[side === 'left' ? 0 : 1]?.focus()
}

function answer(side, action) {
  // While the flash shows, the next pair is hidden: ignore picks and ties so input only ever
  // counts for a pair the user can see.
  if (flash.value) return
  const answered = store.pair
  const hadFocus = focusedSide()
  action()
  if (!answered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  refocusSide = hadFocus
  flash.value = { id: ++flashId, pair: answered, side }
  flashTimer = setTimeout(endFlash, FLASH_MS)
}
const pick = (side) => answer(side, () => store.pick(side))
const tie = () => answer('tie', () => store.tie())
function undo() {
  endFlash()
  store.undo()
}
const stamped = (side) => flash.value?.side === side

// ← picks left, → picks right, ↓ or S calls it a tie (R2, P1-3).
function onKeydown(e) {
  if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
  if (e.key === 'ArrowLeft') pick('left')
  else if (e.key === 'ArrowRight') pick('right')
  else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') tie()
  else return
  e.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(flashTimer)
})

const MILESTONES = {
  start: 'Tap the one you like more',
  half: 'Halfway there',
  almost: 'Almost done',
  ready: 'Extra picks make it even sharper',
}
const milestone = computed(() => MILESTONES[store.stage])
</script>

<template>
  <section class="compare">
    <h2 class="headline">Who's your pick?</h2>

    <div class="progress">
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
        {{ store.decisions }} picks in!
      </span>
      <button type="button" class="cta" @click="$emit('show-results')">See my ranking so far</button>
    </div>

    <div v-if="store.pair" class="stage" :style="timing">
      <div
        ref="pairEl"
        class="pair"
        :class="{ 'pair--waiting': flash, 'pair--reveal': revealing }"
      >
        <IdolCard :idol="store.pair[0]" side="left" key-hint="←" @pick="pick('left')" />
        <IdolCard :idol="store.pair[1]" side="right" key-hint="→" @pick="pick('right')" />
      </div>

      <div v-if="flash" :key="flash.id" class="flash pair" aria-hidden="true" inert>
        <div
          v-for="(side, i) in ['left', 'right']"
          :key="side"
          class="flash__slot"
          :class="{ 'flash__slot--chosen': stamped(side) }"
        >
          <IdolCard :idol="flash.pair[i]" :side="side" />
          <span v-if="stamped(side)" class="stamp">
            <AppIcon name="sparkle" :size="64" />
          </span>
        </div>
        <span v-if="flash.side === 'tie'" class="stamp stamp--tie">
          <AppIcon name="sparkle" :size="64" />
        </span>
      </div>
    </div>

    <div class="controls">
      <button type="button" class="control" aria-keyshortcuts="S" @click="tie()">
        Too close to call <kbd aria-hidden="true">S</kbd>
      </button>
      <button
        type="button"
        class="control"
        :disabled="store.comparisons.length === 0"
        @click="undo()"
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

/* The answered pair, held fully opaque on top while the sticker lands, then flipped away
   edge-on. The next pair waits hidden and flips in from the other edge. No opacity fades:
   a cross-fade would blend two idols' faces. Timing comes from the --hold / --flip /
   --stagger variables set in the script (the same numbers end the flash). */
.flash {
  position: absolute;
  inset: 8px 0 auto;
  z-index: 2;
  pointer-events: none;
  perspective: 900px;
}
.flash__slot {
  position: relative;
  animation: flip-out var(--flip) ease-in var(--hold) forwards;
}
.flash__slot:nth-child(2) {
  animation-delay: calc(var(--hold) + var(--stagger));
}
@keyframes flip-out {
  to {
    transform: rotateY(90deg);
  }
}
.pair--waiting {
  visibility: hidden;
}
.pair--reveal {
  perspective: 900px;
}
.pair--reveal > :deep(*) {
  animation: flip-in var(--flip) ease-out backwards;
}
.pair--reveal > :deep(:nth-child(2)) {
  animation-delay: var(--stagger);
}
@keyframes flip-in {
  from {
    transform: rotateY(-90deg);
  }
}
.flash__slot--chosen {
  animation:
    thump 0.45s ease-out,
    flip-out var(--flip) ease-in var(--hold) forwards;
}
.flash__slot--chosen:nth-child(2) {
  animation:
    thump 0.45s ease-out,
    flip-out var(--flip) ease-in calc(var(--hold) + var(--stagger)) forwards;
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
/* Tie: one sticker centered on the gap between the cards, shrinking away as they flip. */
.flash > .stamp--tie {
  left: 50%;
  right: auto;
  margin-left: -32px;
  animation:
    stamp 0.45s cubic-bezier(0.2, 0.8, 0.3, 1.2) both,
    stamp-out var(--flip) ease-in var(--hold) forwards;
}
@keyframes stamp-out {
  to {
    transform: scale(0);
  }
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
  .flash > .stamp--tie {
    right: auto;
    margin-left: -24px;
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
  .pair--reveal > :deep(*) {
    animation: none;
  }
}
</style>
