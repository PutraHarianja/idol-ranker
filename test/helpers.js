// Seeded PRNG (mulberry32) so simulation tests are deterministic.
export function seededRandom(seed) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Kendall tau between two score arrays over the same items (no ties expected).
export function kendallTau(a, b) {
  let concordant = 0
  let discordant = 0
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const s = Math.sign(a[i] - a[j]) * Math.sign(b[i] - b[j])
      if (s > 0) concordant++
      else if (s < 0) discordant++
    }
  }
  return (concordant - discordant) / (concordant + discordant)
}
