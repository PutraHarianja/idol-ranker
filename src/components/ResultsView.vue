<script setup>
import { ref } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolAvatar from './IdolAvatar.vue'
import { formatRankingText } from '../ranking/exportText.js'

const store = useRankingStore()
const emit = defineEmits(['back'])
const confirmingReset = ref(false)
const copyStatus = ref('')

// Copies the ranking as a text list (P1-5).
async function copyRanking() {
  const text = formatRankingText(store.ranking, {
    decisions: store.decisions,
    provisional: store.isProvisional,
  })
  try {
    await navigator.clipboard.writeText(text)
    copyStatus.value = 'Copied!'
  } catch {
    copyStatus.value = "Couldn't copy — your browser blocked clipboard access."
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
    <p v-if="store.isProvisional" class="banner" role="status">
      <strong>Provisional</strong> — keep comparing for a more accurate ranking.
    </p>

    <p class="help">
      <strong>Goddess Score</strong> (0–100) is the % chance she beats an average idol, based on
      your {{ store.decisions }} {{ store.decisions === 1 ? 'pick' : 'picks' }}.
    </p>

    <ol class="list">
      <li
        v-for="entry in store.ranking"
        :key="entry.id"
        class="row"
        :class="{ 'row--top': entry.rank <= 3 }"
      >
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
      <button type="button" class="primary" @click="emit('back')">Keep comparing</button>
      <button type="button" class="plain" @click="copyRanking">Copy as text</button>
      <span v-if="copyStatus" class="copy-status" role="status">{{ copyStatus }}</span>
      <template v-if="!confirmingReset">
        <button type="button" class="danger-link" @click="confirmingReset = true">
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
.banner {
  margin: 0;
  padding: 0.8rem 1rem;
  border-radius: var(--radius);
  background: var(--warn-soft);
  color: var(--warn-text);
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
.list {
  margin: 0;
  padding: 0.35rem 1rem;
  border-radius: 18px;
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
  color: var(--muted);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 500;
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
  height: 4px;
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
  font-size: 1.1rem;
  font-weight: 700;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}
/* The top three get bigger photos and type, like the front of a binder. */
.row--top {
  grid-template-columns: 1.75rem 56px 1fr auto;
  padding: 0.8rem 0;
}
.row--top .rank {
  color: var(--text);
  font-size: 1.1rem;
  font-weight: 700;
}
.row--top .thumb {
  border-radius: 8px;
  font-size: 1.25rem;
}
.row--top .name {
  font-size: 1.1rem;
}
.row--top .score {
  font-size: 1.35rem;
}
.row--top .meter {
  height: 6px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.copy-status {
  color: var(--muted);
  font-size: 0.9rem;
}
.confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--danger);
  border-radius: var(--radius);
  font-weight: 600;
}
button {
  min-height: 44px;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  border-radius: 999px;
  padding: 0.6rem 1.2rem;
}
button:focus-visible {
  outline: 2px solid var(--accent);
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
.plain,
.danger-link {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
.plain:hover,
.danger-link:hover {
  border-color: var(--muted);
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
  .list {
    padding: 0.25rem 0.75rem;
  }
  .row,
  .row--top {
    gap: 0.6rem;
  }
}
</style>
