// Hardcoded v1 dataset (PRD Appendix A). `id` is a stable slug, never the array index.
// `image` ({ src, author, license, sourceUrl }) is optional (R10). Photos are from Wikimedia
// Commons, cropped to 3:4 and resized; see the Credits view.
const IDOLS = [
  {
    id: 'blackpink-jisoo',
    name: 'Jisoo',
    group: 'BLACKPINK',
    image: {
      src: '/idols/blackpink-jisoo.jpg',
      author: '티비텐 TV10',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jisoo_at_Boyfriend_on_Demand_press_conference_on_26022026_(12).png',
    },
  },
  {
    id: 'blackpink-jennie',
    name: 'Jennie',
    group: 'BLACKPINK',
    image: {
      src: '/idols/blackpink-jennie.jpg',
      author: '티비텐',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:20260526_Jennie_Kim_04.jpg',
    },
  },
  {
    id: 'blackpink-rose',
    name: 'Rosé',
    group: 'BLACKPINK',
    image: {
      src: '/idols/blackpink-rose.jpg',
      author: 'TV10',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Blackpink_Ros%C3%A9_Rimowa_1.jpg',
    },
  },
  {
    id: 'twice-nayeon',
    name: 'Nayeon',
    group: 'TWICE',
    image: {
      src: '/idols/twice-nayeon.jpg',
      author: '티비텐 TV10',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nayeon_251120_1.jpg',
    },
  },
  {
    id: 'twice-tzuyu',
    name: 'Tzuyu',
    group: 'TWICE',
    image: {
      src: '/idols/twice-tzuyu.jpg',
      author: 'David Lee from Redmond, WA, USA',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Twice_in_Seattle_2026_-_TWICE._Tzuyu_(55045325500)_(cropped).jpg',
    },
  },
  {
    id: 'twice-sana',
    name: 'Sana',
    group: 'TWICE',
    image: {
      src: '/idols/twice-sana.jpg',
      author: 'TV10',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Sana_Minatozaki_in_April_2026.png',
    },
  },
  {
    id: 'redvelvet-irene',
    name: 'Irene',
    group: 'Red Velvet',
    image: {
      src: '/idols/redvelvet-irene.jpg',
      author: '티비텐',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:250320_%EB%A0%88%EB%93%9C%EB%B2%A8%EB%B2%B3_Irene_UGG_Photo_Call.jpg',
    },
  },
  {
    id: 'redvelvet-joy',
    name: 'Joy',
    group: 'Red Velvet',
    image: {
      src: '/idols/redvelvet-joy.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:JOY_Park_Sooyoung.jpg',
    },
  },
  {
    id: 'redvelvet-seulgi',
    name: 'Seulgi',
    group: 'Red Velvet',
    image: {
      src: '/idols/redvelvet-seulgi.jpg',
      author: '티비텐',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kang_Seulgi_LONGCHAMP_2024.jpg',
    },
  },
  {
    id: 'aespa-karina',
    name: 'Karina',
    group: 'aespa',
    image: {
      src: '/idols/aespa-karina.jpg',
      author: '티비텐 TV10',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Karina_at_Gimpo_Airport_on_April_22,_2026_03.png',
    },
  },
  {
    id: 'aespa-winter',
    name: 'Winter',
    group: 'aespa',
    image: {
      src: '/idols/aespa-winter.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Winter_at_Incheon_Airport_on_July_10,_2026.png',
    },
  },
  {
    id: 'aespa-ningning',
    name: 'Ningning',
    group: 'aespa',
    image: {
      src: '/idols/aespa-ningning.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:072926_Ningning_at_Gucci_photocall_05.png',
    },
  },
  {
    id: 'ive-wonyoung',
    name: 'Wonyoung',
    group: 'IVE',
    image: {
      src: '/idols/ive-wonyoung.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jang_Won-young_at_the_Bulgari_Eclettica_event_in_Seoul,_May_12,_2026_(1).png',
    },
  },
  {
    id: 'ive-yujin',
    name: 'Yujin',
    group: 'IVE',
    image: {
      src: '/idols/ive-yujin.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:IVE_Yujin_2026_GDA.jpg',
    },
  },
  {
    id: 'ive-rei',
    name: 'Rei',
    group: 'IVE',
    image: {
      src: '/idols/ive-rei.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rei_of_Ive_at_the_Valentino_event,_March_20,_2026_(4).png',
    },
  },
  {
    id: 'lesserafim-sakura',
    name: 'Sakura',
    group: 'LE SSERAFIM',
    image: {
      src: '/idols/lesserafim-sakura.jpg',
      author: '티비텐 TV10',
      license: 'CC BY 4.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:20260110_Le_Sserafim%27s_Sakura_Miyawaki_01.png',
    },
  },
  {
    id: 'lesserafim-kazuha',
    name: 'Kazuha',
    group: 'LE SSERAFIM',
    image: {
      src: '/idols/lesserafim-kazuha.jpg',
      author: '티비텐',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kazuha_of_Le_Sserafim,_April_5,_2024_(2).png',
    },
  },
  {
    id: 'lesserafim-chaewon',
    name: 'Chaewon',
    group: 'LE SSERAFIM',
    image: {
      src: '/idols/lesserafim-chaewon.jpg',
      author: 'K-POPIT 케이팝잇',
      license: 'CC BY 3.0',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:240329_Kim_Chae-won_(1).jpg',
    },
  },
]

// Background color for each group's initials avatar (used when a photo is missing).
const GROUP_COLORS = {
  BLACKPINK: '#d6336c',
  TWICE: '#f08c00',
  'Red Velvet': '#c92a2a',
  aespa: '#5f3dc4',
  IVE: '#1971c2',
  'LE SSERAFIM': '#2b8a3e',
}

export function getGroupColor(group) {
  return GROUP_COLORS[group] ?? '#495057'
}

// Single access point for idol data, so the source can be swapped later (P2-1).
export function getIdols() {
  return IDOLS.map((idol) => ({ ...idol }))
}
