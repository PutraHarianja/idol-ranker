<script setup>
import IdolAvatar from './IdolAvatar.vue'

defineProps({
  idol: { type: Object, required: true },
  keyHint: { type: String, default: '' },
})
defineEmits(['pick'])
</script>

<template>
  <button class="card" type="button" @click="$emit('pick')">
    <IdolAvatar :idol="idol" />
    <span class="name">{{ idol.name }}</span>
    <span class="group">{{ idol.group }}</span>
    <kbd v-if="keyHint" class="hint">{{ keyHint }}</kbd>
  </button>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  min-width: 0;
  padding: 0.75rem 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: calc(var(--radius) + 4px);
  background: var(--surface);
  color: var(--text);
  font: inherit;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    border-color 0.15s ease;
}
.card:hover {
  border-color: var(--accent);
}
.card:active {
  transform: scale(0.98);
}
.card:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.name {
  margin-top: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}
.group {
  color: var(--muted);
  font-size: 0.9rem;
}
.hint {
  margin-top: 0.25rem;
  padding: 0 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--muted);
  font-size: 0.8rem;
}
@media (max-width: 559px) {
  .card {
    padding: 0.5rem 0.5rem 0.75rem;
  }
  .name {
    font-size: 1.05rem;
  }
  .group {
    font-size: 0.8rem;
  }
}
@media (hover: none) {
  .hint {
    display: none;
  }
}
</style>
