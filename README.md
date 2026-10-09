# 👑 Idol Ranker

Rank your favorite K-pop idols by picking between two at a time. A [Bradley-Terry](https://en.wikipedia.org/wiki/Bradley%E2%80%93Terry_model) model turns your picks into a ranked list with a 0–100 **Goddess Score** for each idol.

- 18 idols from BLACKPINK, TWICE, Red Velvet, aespa, IVE and LE SSERAFIM
- Pick with a tap or the arrow keys, call it a tie with `S`, undo your last pick
- Progress is saved in your browser; refreshing loses nothing
- Copy your ranking as text
- Photos from Wikimedia Commons, credited in the app

**Live: https://putraharianja.github.io/idol-ranker/**

Runs entirely in the browser. No backend, no accounts.

## Run it

Requires Node 24 (pinned in `.nvmrc`).

```bash
nvm use
npm install
npm run dev      # http://localhost:5173
```

## Test and build

```bash
npm test         # Vitest
npm run build    # production build in dist/
```

## How it's built

Vue 3 + Vite, Pinia, plain JavaScript, Vitest.

```
src/data/          idol dataset, read through getIdols()
src/ranking/       Bradley-Terry fit, pair selection, scores (pure JS, no Vue)
src/persistence/   saves the comparison log to localStorage
src/stores/        Pinia store
src/components/    UI
public/idols/      photos (450×600 JPEG)
test/              Vitest suites
```

Only the log of picks is saved; the ranking is always refit from it.

## Docs

The PRD, technical design, decision log and tasks live in the project's Notion workspace.

## Photo credits

All idol photos are from [Wikimedia Commons](https://commons.wikimedia.org/) under CC BY 3.0 / 4.0 licenses, cropped and resized. Authors and sources are listed in [`src/data/idols.js`](src/data/idols.js) and on the app's Credits page.
