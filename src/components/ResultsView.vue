<script setup>
import { ref } from 'vue'
import { useRankingStore } from '../stores/ranking.js'
import IdolAvatar from './IdolAvatar.vue'

const store = useRankingStore()
const emit = defineEmits(['back'])
const confirmingReset = ref(false)

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
      <li v-for="entry in store.ranking" :key="entry.id" class="row">
        <span class="rank">{{ entry.rank }}</span>
        <IdolAvatar class="thumb" :idol="entry.idol" />
        <span class="who">
          <span class="name">{{ entry.idol.name }}</span>
          <span class="group">{{ entry.idol.group }}</span>
        </span>
        <span class="score" :aria-label="`Goddess Score ${entry.score}`">{{ entry.score }}</span>
      </li>
    </ol>

    <div class="actions">
      <button type="button" class="primary" @click="emit('back')">Keep comparing</button>
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
  gap: 1rem;
}
.banner {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  background: var(--warn-soft);
  color: var(--warn-text);
}
.help {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
}
.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
.row {
  display: grid;
  grid-template-columns: 2rem 40px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}
.rank {
  color: var(--muted);
  font-weight: 700;
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
  font-weight: 600;
}
.group {
  color: var(--muted);
  font-size: 0.85rem;
}
.score {
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
.confirm {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
button {
  font: inherit;
  cursor: pointer;
  border-radius: 999px;
  padding: 0.55rem 1.1rem;
}
.primary {
  border: none;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.danger {
  border: none;
  background: var(--danger);
  color: #fff;
}
.plain,
.danger-link {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
}
.danger-link {
  color: var(--danger);
}
</style>
