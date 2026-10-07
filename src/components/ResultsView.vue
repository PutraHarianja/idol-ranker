<script setup>
import { computed, ref } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolAvatar from './IdolAvatar.vue'
import AppIcon from './AppIcon.vue'
import { formatRankingText } from '../ranking/exportText.js'

const store = useRankingStore()
const emit = defineEmits(['back'])
const confirmingReset = ref(false)
const copyStatus = ref('')

// The top three sit on a "binder page"; everyone else is in the list below.
const top = computed(() => store.ranking.slice(0, 3))
const rest = computed(() => store.ranking.slice(3))

// Copies the ranking as a text list (P1-5).
async function copyRanking() {
  const text = formatRankingText(store.ranking, {
    decisions: store.decisions,
    provisional: store.isProvisional,
  })
  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = "Couldn't copy. Your browser blocked clipboard access."
  }
  setTimeout(() => (copyStatus.value = ''), 2500)
}

function confirmReset() {
  store.reset()
  confirmingReset.value = false
  emit('back')
}
</script>

<template>
  <section class="results">
    <h2 class="headline">Your top picks</h2>

    <p class="help">
      You know exactly who you love. These are the idols you kept choosing across your
      {{ store.decisions }} {{ store.decisions === 1 ? 'pick' : 'picks' }}, each with her
      <strong>Goddess Score</strong>.
    </p>

    <p v-if="store.isProvisional" class="banner" role="status">
      Just a first look. Keep picking for a more accurate ranking.
    </p>

    <ol class="podium">
      <li
        v-for="(entry, i) in top"
        :key="entry.id"
        class="spot"
        :class="`spot--${i + 1}`"
      >
        <span class="spot__card">
          <span class="spot__tape" aria-hidden="true" />
          <IdolAvatar class="spot__photo" :idol="entry.idol" />
          <span v-if="i === 0" class="spot__sticker" aria-hidden="true">
            <AppIcon name="sparkle" :size="34" />
          </span>
        </span>
        <span class="spot__rank">#{{ entry.rank }}</span>
        <span class="spot__name">{{ entry.idol.name }}</span>
        <span class="spot__group">{{ entry.idol.group }}</span>
        <span class="spot__score"><span class="sr-only">Goddess Score </span>{{ entry.score }}</span>
      </li>
    </ol>

    <ol v-if="rest.length" class="list">
      <li v-for="entry in rest" :key="entry.id" class="row">
        <span class="rank">{{ entry.rank }}</span>
        <IdolAvatar class="thumb" :idol="entry.idol" />
        <span class="who">
          <span class="name">{{ entry.idol.name }}</span>
          <span class="group">{{ entry.idol.group }}</span>
          <span class="meter" aria-hidden="true">
            <span class="meter__fill" :style="{ width: `${entry.score}%` }" />
          </span>
        </span>
        <span class="score"><span class="sr-only">Goddess Score </span>{{ entry.score }}</span>
      </li>
    </ol>

    <div class="actions">
      <button type="button" class="primary" @click="emit('back')">Keep picking</button>
      <button type="button" class="plain" @click="copyRanking">
        <AppIcon name="copy" :size="16" />
        Copy as text
      </button>
      <span v-if="copyStatus" class="copy-status" role="status">{{ copyStatus }}</span>
      <template v-if="!confirmingReset">
        <button type="button" class="plain danger-link" @click="confirmingReset = true">
          <AppIcon name="restart" :size="16" />
          Start over
        </button>
      </template>
      <div v-else class="confirm" role="alertdialog" aria-label="Confirm start over">
        <span>Delete all {{ store.decisions }} picks?</span>
        <button type="button" class="danger" @click="confirmReset">Yes, start over</button>
        <button type="button" class="plain" @click="confirmingReset = false">Cancel</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.headline {
  margin: 0 0 -0.6rem;
  font-family: var(--font-display);
  font-size: clamp(1.7rem, 7vw, 2.4rem);
  font-weight: 400;
  line-height: 1.05;
}
.banner {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--warn-soft);
  color: var(--warn-text);
  font-weight: 600;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Binder page: #2 · #1 · #3, with #1 biggest in the middle. */
.podium {
  display: grid;
  grid-template-columns: 1fr 1.3fr 1fr;
  align-items: end;
  gap: 0.9rem;
  margin: 0;
  padding: 1.25rem 1rem 1rem;
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
  list-style: none;
}
.spot {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  text-align: center;
}
.spot--1 {
  order: 2;
}
.spot--2 {
  order: 1;
}
.spot--3 {
  order: 3;
}
.spot__card {
  position: relative;
  width: 100%;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--surface);
  transform: rotate(-2deg);
}
.spot--1 .spot__card {
  transform: rotate(1deg);
}
.spot--3 .spot__card {
  transform: rotate(2deg);
}
.spot__tape {
  position: absolute;
  top: -7px;
  left: 50%;
  z-index: 1;
  width: 44%;
  height: 13px;
  background: var(--tape-2);
  opacity: 0.92;
  transform: translateX(-50%) rotate(-3deg);
}
.spot--1 .spot__tape {
  background: var(--tape-1);
}
.spot__photo {
  border-radius: 7px;
  font-size: 1.5rem;
}
.spot__sticker {
  position: absolute;
  top: -14px;
  right: -12px;
  color: var(--accent);
  filter: drop-shadow(0 2px 0 var(--text));
}
.spot__rank {
  margin-top: 0.6rem;
  font-family: var(--font-display);
  font-size: 0.95rem;
}
.spot--1 .spot__rank {
  font-size: 1.25rem;
  color: var(--accent);
}
.spot__name {
  max-width: 100%;
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 0.95rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.spot--1 .spot__name {
  font-size: 1.15rem;
}
.spot__group {
  max-width: 100%;
  overflow: hidden;
  color: var(--muted);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.spot__score {
  margin-top: 0.2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.list {
  margin: 0;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
  list-style: none;
}
.row {
  display: grid;
  grid-template-columns: 1.75rem 40px 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}
.row:last-child {
  border-bottom: none;
}
.rank {
  font-family: var(--font-display);
  font-size: 0.9rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.thumb {
  font-size: 1rem;
  border-radius: 6px;
}
.who {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 700;
}
.group {
  color: var(--muted);
  font-size: 0.85rem;
}
.meter {
  height: 5px;
  margin-top: 0.4rem;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.meter__fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
}
.score {
  min-width: 2.5ch;
  font-family: var(--font-display);
  font-size: 1.05rem;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.help {
  margin: 0;
  max-width: 60ch;
  color: var(--muted);
  font-size: 0.9rem;
}
.help strong {
  color: var(--text);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.copy-status {
  font-size: 0.9rem;
  font-weight: 600;
}
.confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: inset 0 0 0 2px var(--danger);
  font-weight: 600;
}
button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
button:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
.primary {
  background: var(--accent);
  color: var(--on-accent);
}
.danger {
  background: var(--danger);
  color: var(--on-accent);
}
.plain {
  background: var(--surface);
  box-shadow: var(--shadow);
  color: var(--text);
}
.danger-link {
  color: var(--danger);
}
/* Start over sits apart from the safe actions. */
.danger-link,
.confirm {
  margin-left: auto;
}
@media (max-width: 559px) {
  .podium {
    gap: 0.6rem;
    padding: 1.1rem 0.75rem 0.85rem;
  }
  .spot__name {
    font-size: 0.8rem;
  }
  .spot--1 .spot__name {
    font-size: 0.95rem;
  }
  .list {
    padding: 0.25rem 0.75rem;
  }
  .row {
    gap: 0.6rem;
  }
  /* Phones: the two safe actions share the first row; Start over keeps its pill but sits
     alone, centered, on the row below instead of being pushed to the right edge. */
  .actions > .primary,
  .actions > .plain:not(.danger-link) {
    flex: 1 1 calc(50% - 0.3rem);
    justify-content: center;
    white-space: nowrap;
  }
  .copy-status {
    flex-basis: 100%;
    text-align: center;
  }
  .danger-link {
    margin: 0.25rem auto 0;
  }
  .confirm {
    flex-basis: 100%;
    margin-left: 0;
  }
}
</style>
