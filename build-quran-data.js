// OPTIONAL — the app no longer needs this file. It now pulls a random
// verse live from ummahapi.com on every tap, so there's nothing to
// pre-generate. Keep this script only if you'd rather self-host the full
// Qur'an text instead of depending on that live API — in that case you'd
// also need to change index.html to fetch ./data/quran.json again instead
// of calling the live endpoint.
//
// Run this ONCE on your own machine (needs internet + Node 18+):
//
//   node scripts/build-quran-data.js
//
// It downloads all 114 chapters (Arabic + English translation) from the
// quran-json CDN and writes them into data/quran.json as a flat array of
// 6,236 verses.

const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'data', 'quran.json');

async function fetchChapter(n) {
  const url = `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/${n}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Chapter ${n} failed: ${res.status}`);
  return res.json();
}

async function main() {
  console.log('Downloading 114 chapters...');
  const verses = [];

  for (let n = 1; n <= 114; n++) {
    const surah = await fetchChapter(n);
    surah.verses.forEach(function (ayah) {
      verses.push({
        surah: surah.id,
        ayah: ayah.id,
        surahName: surah.transliteration,
        arabic: ayah.text,
        text: ayah.translation,
        ref: "Qur'an " + surah.id + ':' + ayah.id + ' — ' + surah.transliteration
      });
    });
    process.stdout.write(`\r  chapter ${n}/114 done`);
  }

  console.log(`\nTotal verses: ${verses.length}`);
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(verses));
  console.log('Wrote', OUT_PATH);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
