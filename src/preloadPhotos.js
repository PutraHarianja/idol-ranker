// Starts loading an idol's photo so it is cached by the time the card appears (F9).
const preloaded = new Set()

export function preloadPhotos(idols, baseUrl = import.meta.env.BASE_URL) {
  for (const idol of idols ?? []) {
    const src = idol.image?.src
    if (!src || preloaded.has(src)) continue
    preloaded.add(src)
    new Image().src = `${baseUrl}${src.slice(1)}`
  }
}
