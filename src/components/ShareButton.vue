<script setup>
import { ref, watch, nextTick } from 'vue'
import AppIcon from './AppIcon.vue'
import AppToast from './AppToast.vue'

// Display only. The parent calls shareApp() and passes its result back as `status`:
// '' (nothing to show), 'copied' ("Link copied") or 'manual' (link shown as selectable text).
const props = defineProps({
  status: { type: String, default: '' },
  url: { type: String, required: true },
})
const emit = defineEmits(['share', 'dismiss'])

function close() {
  emit('dismiss')
  shareEl.value.focus()
}

const shareEl = ref(null)
const linkEl = ref(null)
// Focus and select the link on open so one Copy gesture finishes the job.
watch(
  () => props.status,
  async (status) => {
    if (status !== 'manual') return
    await nextTick()
    const range = document.createRange()
    linkEl.value.focus()
    range.selectNodeContents(linkEl.value)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
  },
)
</script>

<template>
  <button ref="shareEl" type="button" class="share" aria-label="Share" title="Share" @click="$emit('share')">
    <AppIcon name="share" :size="20" />
  </button>
  <AppToast :show="status === 'copied'">Link copied</AppToast>
  <div v-if="status === 'manual'" class="share-note share-note--manual">
    <p id="share-note-line" class="share-note__line">Couldn't copy. Here's the link:</p>
    <p ref="linkEl" class="share-note__link" tabindex="-1" aria-describedby="share-note-line">{{ url }}</p>
    <button type="button" class="share-note__close" @click="close">Close</button>
  </div>
</template>

<style scoped>
.share {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    color 0.15s ease;
}
.share:hover {
  background: var(--text);
  color: var(--surface);
}
.share:active {
  transform: scale(0.96);
}
.share:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
.share-note {
  flex-basis: 100%;
  margin: 0;
}
.share-note--manual {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius);
  background: var(--surface);
  box-shadow: var(--shadow);
}
.share-note__line {
  flex-basis: 100%;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}
.share-note__link:focus-visible,
.share-note__link:focus {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
.share-note__link {
  flex: 1 1 100%;
  min-width: 0;
  margin: 0;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  background: var(--bg);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
  user-select: all;
}
.share-note__close {
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
.share-note__close:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .share,
  .share:active {
    transition: none;
    transform: none;
  }
}
</style>
