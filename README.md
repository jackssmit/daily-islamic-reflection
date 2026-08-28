# Daily Reflection — setup

## One-time step before your first deploy

`data/quran.json` is **not included** — it's the full 6,236-verse Qur'an
(Arabic + English) and needs to be generated once, on your own machine,
where you have normal internet access:

```bash
node scripts/build-quran-data.js
```

This downloads all 114 chapters and writes `data/quran.json` (a few MB).
Commit that file to your repo:

```bash
git add data/quran.json
git commit -m "Add full Qur'an data"
git push
```

`data/hadith.json` and `data/wisdom.json` are already included and ready
to commit as-is — edit them any time to add more entries (each item needs
`text`, `ref`, and `mood`: `"happy"`, `"emotional"`, or `"peace"`).

## Deploying on Vercel

Nothing special — it's a static site. Point Vercel at the repo root and
deploy. The app fetches `./data/quran.json`, `./data/hadith.json`, and
`./data/wisdom.json` as same-origin files, so there's no CDN dependency
and no extra config needed.

## How the "verse of the moment" works

The Qur'an verse shown matches the visitor's current local time: the hour
picks the surah, the minute picks the ayah (e.g. 5:58 → Surah 5, Ayah 58).
If a surah has fewer ayahs than the minute value, it wraps around within
that surah so there's always a match. It updates automatically while the
page is open, and refreshes on every mood tap.
