<script setup>
import IdolAvatar from './IdolAvatar.vue'

defineProps({
  idol: { type: Object, required: true },
  keyHint: { type: String, default: '' },
  // Which way the card leans and which tape color it gets, like cards stuck in a binder.
  side: { type: String, default: 'left' },
})
defineEmits(['pick'])
</script>

<template>
  <button
    class="card"
    :class="`card--${side}`"
    type="button"
    :aria-label="`Pick ${idol.name}, ${idol.group}`"
    @click="$emit('pick')"
  >
    <span class="tape" aria-hidden="true" />
    <IdolAvatar class="photo" :idol="idol" />
    <span class="caption">
      <span class="name">{{ idol.name }}</span>
      <span class="group">{{ idol.group }}</span>
    </span>
    <kbd v-if="keyHint" class="hint">{{ keyHint }}</kbd>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  padding: 7px 7px 10px;
  border: none;
  border-radius: 14px;
  background: var(--surface);
  box-shadow: var(--shadow);
  color: var(--text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.card--left {
  transform: rotate(-2deg);
}
.card--right {
  transform: rotate(1.5deg);
}
.card:hover,
.card:focus-visible {
  transform: translateY(-4px) rotate(0deg);
}
.card:active {
  transform: scale(0.97);
}
.card:focus-visible {
  outline: 3px solid var(--text);
  outline-offset: 3px;
}
.tape {
  position: absolute;
  top: -8px;
  left: 50%;
  z-index: 1;
  width: 42%;
  height: 16px;
  background: var(--tape-1);
  opacity: 0.92;
  transform: translateX(-50%) rotate(-3deg);
}
.card--right .tape {
  background: var(--tape-2);
  transform: translateX(-50%) rotate(2deg);
}
.photo {
  border-radius: 9px;
}
.caption {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0.55rem 0.3rem 0;
}
.name {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 1.2rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group {
  overflow: hidden;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hint {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.35rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.8rem;
}
@media (max-width: 559px) {
  .card {
    padding: 5px 5px 8px;
    border-radius: 11px;
  }
  .photo {
    border-radius: 7px;
  }
  .caption {
    padding: 0.4rem 0.2rem 0;
  }
  .name {
    font-size: 0.95rem;
  }
  .group {
    font-size: 0.75rem;
  }
  .tape {
    height: 12px;
    top: -6px;
  }
}
@media (hover: none) {
  .hint {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .card,
  .card:hover,
  .card:focus-visible,
  .card:active {
    transition: none;
  }
}
</style>
