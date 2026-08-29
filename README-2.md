# Gym Nation Mysuru — Website

Static site, no build step. `index.html` + `style.css` + `script.js` + `assets/logo.jpg`.

## Deploy (GitHub → Vercel)

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com), **Add New → Project**, import the repo.
3. Framework preset: **Other**. Root directory: leave default. Build command: none needed.
4. Deploy. Every push to `main` auto-redeploys.

## Editing your details

Almost everything gym-specific lives at the top of **`script.js`**, in the `CONFIG` object:

- `tournamentName`, `tournamentDate`, `tournamentDateLabel`, `entryFee`
- `categories` — the list people pick from when applying
- `exercises` — the checkboxes shown in step 2
- `whatsappNumber` — see below
- `entryFeeAmount` / `upiId` / `payeeName` — set both `entryFeeAmount` and `upiId` to turn on the payment step (QR + "Pay via UPI app" button); leave `entryFeeAmount` at `0` to show "pay at the gym counter" instead
- `prizes` — leave empty to hide the prizes line entirely; fill in once winners' amounts are decided

The logo is embedded directly in `index.html` as base64, so it can't break from a wrong file path or folder getting dropped during upload — you don't need to touch `assets/logo.jpg` unless you want to swap the logo itself (re-encode the new image to base64 and replace the three occurrences of the data URI).

Address and map are in `index.html` inside `<section id="location">` — edit the text and the map/maps-link URLs if the gym ever moves.

## How the WhatsApp part actually works

WhatsApp does not let any website silently post a message into a group — that's a deliberate WhatsApp restriction, not a limitation of this site. What the form does instead:

1. Person fills the 3-step form and hits **Send to Gym Nation WhatsApp**.
2. The site builds a formatted message from their answers and opens `wa.me` with that message pre-filled.
3. WhatsApp opens (app or web) with a contact/group picker. The person taps your **Gym Nation group**, and hits send themselves.

If you'd rather every application go to one phone number instead (e.g. yours) so you forward them to the group, set `whatsappNumber` in `CONFIG` to that number in international format with no `+` or spaces, e.g. `"919876543210"`.

There's no server, database, or API key involved — it's a plain static site.
