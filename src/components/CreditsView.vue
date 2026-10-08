<script setup>
import { getIdols } from '../data/idols.js'
import IdolAvatar from './IdolAvatar.vue'

defineEmits(['back'])

const credited = getIdols().filter((idol) => idol.image)

const LICENSE_URLS = {
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
}
</script>

<template>
  <section class="credits">
    <h2>Photo credits</h2>
    <p class="intro">
      All photos are from Wikimedia Commons and are used under their free licenses. Each photo was
      cropped to 3:4 and resized.
    </p>
    <ul class="list">
      <li v-for="idol in credited" :key="idol.id" class="row">
        <IdolAvatar class="thumb" :idol="idol" />
        <span class="text">
          <span class="name">{{ idol.name }} <span class="group">· {{ idol.group }}</span></span>
          <span class="meta">
            Photo by {{ idol.image.author }} ·
            <a
              v-if="LICENSE_URLS[idol.image.license]"
              :href="LICENSE_URLS[idol.image.license]"
              target="_blank"
              rel="noopener"
              >{{ idol.image.license }}</a
            ><template v-else>{{ idol.image.license }}</template>
            · <a :href="idol.image.sourceUrl" target="_blank" rel="noopener">Source</a> · cropped
          </span>
        </span>
      </li>
    </ul>
    <button type="button" class="back" @click="$emit('back')">Back</button>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 0.35rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 400;
  line-height: 1.1;
}
.intro {
  max-width: 60ch;
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 0.9rem;
}
.list {
  margin: 0 0 1.25rem;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
  list-style: none;
}
.row {
  display: grid;
  grid-template-columns: 40px 1fr;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}
.row:last-child {
  border-bottom: none;
}
.thumb {
  font-size: 1rem;
  border-radius: 6px;
}
.text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-weight: 700;
}
.group {
  color: var(--muted);
  font-weight: 400;
}
.meta {
  color: var(--muted);
  font-size: 0.85rem;
  overflow-wrap: anywhere;
}
a {
  color: var(--text);
  text-decoration-color: var(--accent);
  text-decoration-thickness: 2px;
  text-underline-offset: 0.15em;
}
.back {
  min-height: 44px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: var(--surface);
  box-shadow: var(--shadow);
  color: var(--text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.back:focus-visible {
  outline: 2px solid var(--text);
  outline-offset: 2px;
}
</style>
