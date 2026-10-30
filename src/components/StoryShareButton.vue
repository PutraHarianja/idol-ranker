<script setup>
import { computed, ref } from 'vue'
import AppIcon from './AppIcon.vue'

// "Share to Story" (P1-9). Display only: the parent shares public/story.jpg on `share-story`, shows
// this only where the browser can share files, and passes the link-sticker note back as `hint`:
// '' (hidden), 'copied' (link is on the clipboard) or 'sticker' (copy failed or skipped).
const props = defineProps({
  hint: { type: String, default: '' },
})
const emit = defineEmits(['share-story', 'dismiss'])

const URL_TEXT = 'putraharianja.github.io/idol-ranker'
const announcement = computed(() => {
  if (props.hint === 'copied')
    return 'Link copied. In Instagram, add a Link sticker and paste it so friends can tap through.'
  if (props.hint)
    return `In Instagram, add a Link sticker with ${URL_TEXT} so friends can tap through.`
  return ''
})

const storyEl = ref(null)
function close() {
  emit('dismiss')
  storyEl.value.focus()
}
</script>

<template>
  <button ref="storyEl" type="button" class="story" @click="$emit('share-story')">
    <AppIcon name="story" :size="18" />
    Share to Story
  </button>
  <!-- Always in the DOM, so screen readers announce the hint when it appears. -->
  <span class="sr-only" role="status">{{ announcement }}</span>
  <!-- A line, not a toast: people read it on their way into Instagram. -->
  <div v-if="hint" class="story-hint">
    <p class="story-hint__line" aria-hidden="true">
      <template v-if="hint === 'copied'">
        <strong>Link copied.</strong> In Instagram, add a Link sticker and paste it so friends can
        tap through.
      </template>
      <template v-else>
        In Instagram, add a Link sticker with
        <strong class="story-hint__url">{{ URL_TEXT }}</strong> so friends can tap through.
      </template>
    </p>
    <button type="button" class="story-hint__close" @click="close">Got it</button>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.story {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  box-shadow:
    inset 0 0 0 2px var(--accent),
    var(--shadow);
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.story .icon {
  color: var(--accent);
}
.story:active {
  transform: scale(0.97);
}
.story:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
.story-hint {
  display: flex;
  flex-basis: 100%;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow:
    inset 4px 0 0 var(--tape-2),
    var(--shadow);
}
.story-hint__line {
  flex: 1 1 18rem;
  margin: 0;
  padding-left: 0.3rem;
  font-size: 0.9rem;
}
.story-hint__url {
  overflow-wrap: anywhere;
}
.story-hint__close {
  min-height: 44px;
  margin-left: auto;
  padding: 0 0.9rem;
  border: none;
  background: none;
  color: var(--text);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.2em;
  cursor: pointer;
}
.story-hint__close:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
/* Phones: its own full-width row under Keep picking and Copy as text. */
@media (max-width: 559px) {
  .story {
    flex: 1 1 100%;
    justify-content: center;
  }
}
@media (prefers-reduced-motion: reduce) {
  .story,
  .story:active {
    transition: none;
    transform: none;
  }
}
</style>
