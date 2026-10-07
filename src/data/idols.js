// Hardcoded v1 dataset (PRD Appendix A). `id` is a stable slug, never the array index.
// `image` ({ src, author, license, sourceUrl }) is optional and added with R10.
const IDOLS = [
  { id: 'blackpink-jisoo', name: 'Jisoo', group: 'BLACKPINK' },
  { id: 'blackpink-jennie', name: 'Jennie', group: 'BLACKPINK' },
  { id: 'blackpink-rose', name: 'Rosé', group: 'BLACKPINK' },
  { id: 'twice-nayeon', name: 'Nayeon', group: 'TWICE' },
  { id: 'twice-tzuyu', name: 'Tzuyu', group: 'TWICE' },
  { id: 'twice-sana', name: 'Sana', group: 'TWICE' },
  { id: 'redvelvet-irene', name: 'Irene', group: 'Red Velvet' },
  { id: 'redvelvet-joy', name: 'Joy', group: 'Red Velvet' },
  { id: 'redvelvet-seulgi', name: 'Seulgi', group: 'Red Velvet' },
  { id: 'aespa-karina', name: 'Karina', group: 'aespa' },
  { id: 'aespa-winter', name: 'Winter', group: 'aespa' },
  { id: 'aespa-ningning', name: 'Ningning', group: 'aespa' },
  { id: 'ive-wonyoung', name: 'Wonyoung', group: 'IVE' },
  { id: 'ive-yujin', name: 'Yujin', group: 'IVE' },
  { id: 'ive-rei', name: 'Rei', group: 'IVE' },
  { id: 'lesserafim-sakura', name: 'Sakura', group: 'LE SSERAFIM' },
  { id: 'lesserafim-kazuha', name: 'Kazuha', group: 'LE SSERAFIM' },
  { id: 'lesserafim-chaewon', name: 'Chaewon', group: 'LE SSERAFIM' },
]

// Single access point for idol data, so the source can be swapped later (P2-1).
export function getIdols() {
  return IDOLS.map((idol) => ({ ...idol }))
}
