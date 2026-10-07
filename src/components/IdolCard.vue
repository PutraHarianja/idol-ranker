<script setup>
import IdolAvatar from './IdolAvatar.vue'

defineProps({
  idol: { type: Object, required: true },
  keyHint: { type: String, default: '' },
})
defineEmits(['pick'])
</script>

<template>
  <!-- Styled as a K-pop photocard: photo inside a printed margin, name printed over the photo. -->
  <button
    class="card"
    type="button"
    :aria-label="`Pick ${idol.name}, ${idol.group}`"
    @click="$emit('pick')"
  >
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
  display: block;
  width: 100%;
  min-width: 0;
  padding: 7px;
  border: none;
  border-radius: 18px;
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
/* The printed margin turns to holographic foil when the card is hovered or focused. */
.card:hover,
.card:focus-visible {
  background: var(--holo);
  transform: translateY(-3px) rotate(-0.6deg);
}
.card:nth-of-type(2):hover,
.card:nth-of-type(2):focus-visible {
  transform: translateY(-3px) rotate(0.6deg);
}
.card:active {
  transform: scale(0.98);
}
.card:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
.photo {
  border-radius: 12px;
}
/* Lift the initials fallback clear of the caption. */
.photo.avatar--initials {
  padding-bottom: 22%;
}
.caption {
  position: absolute;
  right: 7px;
  bottom: 7px;
  left: 7px;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 0.85rem 0.8rem;
  border-radius: 0 0 12px 12px;
  /* Stays dark behind the text so white type reads on light photos too. */
  background: linear-gradient(
    to top,
    rgb(12 10 28 / 0.88) 0%,
    rgb(12 10 28 / 0.72) 65%,
    rgb(12 10 28 / 0) 100%
  );
  color: #fff;
  text-shadow: 0 1px 2px rgb(12 10 28 / 0.6);
}
.name {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.group {
  overflow: hidden;
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.85;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hint {
  position: absolute;
  top: 15px;
  right: 15px;
  display: grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.35rem;
  border-radius: 6px;
  background: rgb(12 10 28 / 0.55);
  color: #fff;
  font-family: var(--font-body);
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
}
@media (max-width: 559px) {
  .card {
    padding: 5px;
    border-radius: 14px;
  }
  .photo {
    border-radius: 10px;
  }
  .caption {
    right: 5px;
    bottom: 5px;
    left: 5px;
    padding: 1.75rem 0.55rem 0.55rem;
    border-radius: 0 0 10px 10px;
  }
  .name {
    font-size: 0.95rem;
  }
  .group {
    font-size: 0.75rem;
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
  .card:nth-of-type(2):hover,
  .card:nth-of-type(2):focus-visible,
  .card:active {
    transform: none;
    transition: none;
  }
}
</style>
