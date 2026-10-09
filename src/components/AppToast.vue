<script setup>
import AppIcon from './AppIcon.vue'

// Short "done" feedback that floats over the page, so nothing else moves. Display only: the
// parent decides when to show and hide it (about 2.5 s) and announces the text itself, which
// is why the toast is aria-hidden. `anchor`: 'top-right' sits under the header's right edge
// (the Share button), 'bottom' sits at the bottom center of the screen.
defineProps({
  show: { type: Boolean, default: false },
  anchor: { type: String, default: 'top-right' },
})
</script>

<template>
  <Transition name="toast">
    <p v-if="show" class="toast" :class="`toast--${anchor}`" aria-hidden="true">
      <AppIcon name="sparkle" :size="16" />
      <slot />
    </p>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  background: var(--tape-2);
  color: #172a55;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: var(--shadow);
  transform: rotate(-2deg);
  pointer-events: none;
}
.toast--top-right {
  top: 4.5rem;
  right: max(16px, calc((100vw - 720px) / 2 + 16px));
}
.toast--bottom {
  bottom: calc(1.25rem + env(safe-area-inset-bottom));
  right: 0;
  left: 0;
  width: max-content;
  margin-inline: auto;
}
.toast-enter-active {
  animation: pop 0.25s ease-out;
}
.toast-leave-active {
  transition: opacity 0.2s ease;
}
.toast-leave-to {
  opacity: 0;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: rotate(-2deg) scale(0.85);
  }
}
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active {
    animation: none;
  }
  .toast-leave-active {
    transition: none;
  }
}
</style>
