# Daily Reflection — setup

## No build step needed

The Qur'an verse is pulled live from [ummahapi.com](https://ummahapi.com/api/quran)
on every tap — a genuinely random verse out of all 6,236, with recitation
audio and a tafsir link included. There's nothing to generate or commit
for it; `scripts/build-quran-data.js` is only kept around as an optional
alternative if you'd rather self-host the Qur'an text instead of depending
on the live API (see below).

`data/hadith.json` and `data/wisdom.json` are already included and
ready to commit as-is — edit them any time to add more entries. Both
need `text`, `ref`, and `mood` (`"happy"`, `"emotional"`, or
`"peace"`).

## Random verse (curated pool)

Alongside the mood buttons is a "🎲 Random verse" button. Unlike the
main reveal — which pulls any of the Qur'an's 6,236 ayahs live from
the API — this draws from a small hand-picked set of well-known,
frequently cited ayahs baked into `index.html` (`BEST_VERSES`), so a
tap is more likely to land on something the reader recognizes rather
than, say, an inheritance ruling. It still respects whichever mood is
currently selected for the hadith/wisdom picks.

## Translate and Listen

Every section (verse, hadith, wisdom) has a **Listen**
button, and the verse also has a separate "Read meaning" button for
its English translation:

- **Listen** / **Read meaning** read that section's English text aloud
  using the browser's built-in speech synthesis
  (`SpeechSynthesisUtterance`) — no API, no audio files, works for
  anyone who'd rather hear it than read it. (The verse's own "Listen"
  button plays real Qur'an recitation audio instead, when available.)
- **Translate** sends the shown English text to the free
  [MyMemory Translation API](https://mymemory.translated.net/doc/spec.php)
  (no key needed) and shows the result in whichever language is picked
  from the "Translate to" dropdown above the results. Translations are
  cached in memory per session so switching back to a language you
  already viewed doesn't re-fetch it.

## Deploying on Vercel

Nothing special — it's a static site. Point Vercel at the repo root and
deploy. The app fetches `./data/hadith.json` and `./data/wisdom.json` as
same-origin files, and calls out to ummahapi.com for the Qur'an verse,
audio, and tafsir — no extra config needed.

## How the verse, audio, and tafsir work

Every tap of a mood button or the refresh button calls
`https://ummahapi.com/api/quran/random` and shows whatever comes back —
no clock matching, no fixed set, no repeats on a cycle. The response also
carries a recitation audio link (used by the "Listen" button) and enough
info to fetch a tafsir for that exact ayah from
`https://ummahapi.com/api/tafsir/ibn_kathir/surah/{surah}/ayah/{ayah}`
(used by the "Tafsir" button, fetched on demand so it doesn't slow down
the initial reveal).

If the live API is ever unreachable (offline, or the service is down),
the app falls back to three verses embedded directly in `index.html` so
it never shows a blank card.

Other ummahapi.com endpoints worth knowing about, if you want to extend
this further: `/api/quran/surahs` (chapter list), `/api/quran/surah/{n}`
(a full chapter), `/api/quran/audio/{n}` (full-surah recitations), and
`/api/hadith/random` / `/api/hadith/collections` (a much larger hadith
pool than the local `hadith.json`, though it can't be filtered by mood
the way the local file is).

An alternative Qur'an source, if you ever want to swap providers:
[fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api).

## Ramadan countdown

The line under the Hijri date shows either "N days until Ramadan" (with
an estimated Gregorian start date) or, once Ramadan begins, "Ramadan
Mubarak — day N". It's computed with the same tabular Hijri calendar
already used for the date display, so it can land a day or two off the
real moon-sighted start — treat it as a close estimate, not an
announcement.
