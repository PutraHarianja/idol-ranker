// Loads and decodes idol photos ahead of time so they are ready when a card flips in (F9, #74, #75).
// The Image objects are kept so the browser can hold their decoded pixels: a hidden <img> is
// downloaded but not decoded until it is first painted, which lands in the first flip frames.
const images = new Map()

function load(idol, baseUrl) {
  const src = idol.image?.src
  if (!src) return null
  let img = images.get(src)
  if (!img) {
    img = new Image()
    img.src = `${baseUrl}${src.slice(1)}`
    images.set(src, img)
  }
  return img
}

export function preloadPhotos(idols, baseUrl = import.meta.env.BASE_URL) {
  for (const idol of idols ?? []) load(idol, baseUrl)
}

// Resolves once every photo is downloaded and decoded. Never rejects: a photo that fails shows
// the initials fallback instead, so it must not block the flip.
export function decodePhotos(idols, baseUrl = import.meta.env.BASE_URL) {
  return Promise.all(
    (idols ?? []).map((idol) =>
      load(idol, baseUrl)
        ?.decode()
        .catch(() => {}),
    ),
  ).then(() => {})
}

// Fetches every photo once the browser is idle (after the first pair has been requested).
export function preloadAllWhenIdle(idols, baseUrl = import.meta.env.BASE_URL) {
  const run = () => preloadPhotos(idols, baseUrl)
  if ('requestIdleCallback' in window) window.requestIdleCallback(run)
  else setTimeout(run, 1000) // shortcut: Safari has no requestIdleCallback; a fixed delay is close enough
}
