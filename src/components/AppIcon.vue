<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 },
})

// Hand-drawn icon set for the sticker-binder look (replaces emoji and Unicode arrows).
const PATHS = {
  sparkle: 'M12 2.5 13.9 10l7.6 2-7.6 2L12 21.5 10.1 14l-7.6-2 7.6-2z',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z',
  undo: 'M4.5 8h10a5 5 0 0 1 0 10H9M4.5 8 8 4.5M4.5 8 8 11.5',
  copy: 'M9 8.5h9.5v11H9zM15 8.5V4.5H5.5v11H9',
  restart: 'M19 12a7 7 0 1 1-2.1-5M19 4.5V9h-4.5',
}
const FILLED = new Set(['sparkle', 'heart'])
</script>

<template>
  <svg
    class="icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      :d="PATHS[name]"
      :fill="FILLED.has(name) ? 'currentColor' : 'none'"
      stroke="currentColor"
      :stroke-width="FILLED.has(name) ? 1.2 : 2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  flex: none;
  vertical-align: middle;
}
</style>
