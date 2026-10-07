<script setup>
import { computed, ref, watch } from 'vue'
import { getGroupColor } from '../data/idols.js'

const props = defineProps({
  idol: { type: Object, required: true },
})

// Falls back to initials when there's no photo or it fails to load (R10).
const failed = ref(false)
watch(() => props.idol.id, () => (failed.value = false))

const showPhoto = computed(() => props.idol.image?.src && !failed.value)
const initials = computed(() =>
  props.idol.name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <img
    v-if="showPhoto"
    class="avatar"
    :src="idol.image.src"
    :alt="idol.name"
    @error="failed = true"
  />
  <div
    v-else
    class="avatar avatar--initials"
    :style="{ background: getGroupColor(idol.group) }"
    aria-hidden="true"
  >
    {{ initials }}
  </div>
</template>

<style scoped>
.avatar {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  border-radius: var(--radius);
}
.avatar--initials {
  display: grid;
  place-items: center;
  color: #fff;
  font-size: clamp(2.5rem, 12vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.04em;
}
</style>
