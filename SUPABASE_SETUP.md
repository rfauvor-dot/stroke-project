# Activating cloud sync + the TTS proxy

Everything below is **built and committed but inert** — the app runs exactly
as it does today (localStorage only, direct ElevenLabs key) until you
complete these steps. Nothing here changes behavior for Bella until you
explicitly configure it.

## Why this exists

Two problems this closes:
1. **Session data only lives on the device it was created on.** Bella
   practices on her phone; Care Partner on your laptop shows nothing. That's
   the actual bug behind "my sessions disappeared" reports.
2. **The ElevenLabs key currently ships to the browser.** Anyone who opens
   dev tools on Bella's phone can read it out of `config.local.js`. Fine for
   a private beta, not fine long-term.

## Part 1 — Supabase project (cloud sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL Editor, paste and run the entire contents of
   `supabase/schema.sql` (already written, already matches everything the
   app code expects — tables, RLS policies, the works).
3. Project Settings → API → copy the **Project URL** and the **anon/public
   key** (NOT the service_role key — that one must never leave the server).
4. Paste both into `app/config.local.js`:
   ```js
   export const SUPABASE_URL = "https://xxxxx.supabase.co";
   export const SUPABASE_ANON_KEY = "eyJ...";
   ```
5. Reload the app. A new "Sync across devices" card appears on Home (patient)
   and "Cross-device sync" on Care Partner (caregiver) — **only now**, because
   `cloud.cloudAvailable` was `false` before this.

### How linking works (already built, no code needed)

- On Bella's device: Home → "Sync across devices" → enter email → she gets a
  magic-link email → clicking it signs her in and creates her patient profile
  automatically (display name pulled from what's already in her local
  profile). A 6-character link code is generated.
- On your device: Care Partner → "Cross-device sync" → enter your email →
  magic link → sign in → enter Bella's link code → connected.
- From then on, both devices pull/push automatically in the background
  (see `app/cloud.js` and the `syncFromCloud`/`save` wiring in `app/store.js`
  for exactly how — it's a local-first mirror, not a replacement for
  localStorage, so the app stays instant and offline-safe either way).

### What I could NOT test

I have no Supabase project of my own to point this at, so **none of the
actual network calls have been exercised against a live database.** What I
verified instead:
- The app is provably unchanged with no config present (full regression
  pass — see MEMORY.md for what was checked).
- `cloud.js` loads without error and every function no-ops safely when
  unconfigured (confirmed directly).
- Every Supabase call maps field-for-field to `schema.sql`'s actual column
  names — I re-read the schema line by line while writing `cloud.js` rather
  than trusting memory, but a live database can still surprise you (a typo
  in a column name, an RLS policy that's stricter than expected, etc.).

**When you activate this, actually walk through the linking flow once
yourself before handing the phone back to Bella** — sign up as a test
patient, link as a test caregiver, do a session, confirm it shows up on the
other "device" (or just a second browser profile). If something's broken,
it'll be an obvious "the button doesn't work" or a console error, not a
silent data-corruption risk — worst case with a bad config is the cloud
sync card shows an error message and the app falls back to localStorage,
exactly like it does today.

## Part 2 — TTS proxy (key stops shipping to the browser)

1. Install the Supabase CLI if you haven't: `npm install -g supabase`
   (or see supabase.com/docs/guides/cli).
2. From this repo: `supabase link --project-ref <your-project-ref>`
   (project ref is in your project's Settings → General).
3. Deploy the function:
   ```
   supabase functions deploy tts-proxy
   ```
4. Set the ElevenLabs key as a **server-side secret** (this is the whole
   point — it never touches `config.local.js` or the browser again):
   ```
   supabase secrets set ELEVENLABS_KEY=sk_...
   ```
   Same key source as before: ElevenCreative workspace, Text-to-Speech
   permission checked at creation.
5. The deploy command prints the function's URL — looks like
   `https://<project-ref>.supabase.co/functions/v1/tts-proxy`. Paste it into
   `app/config.local.js`:
   ```js
   export const TTS_PROXY_URL = "https://xxxxx.supabase.co/functions/v1/tts-proxy";
   ```
6. Reload the app, go to Care Partner → Voice diagnostics → "Test the voice
   now". If it says "configured ✓ (via server proxy...)", it's working and
   the direct `ELEVEN_API_KEY` in `config.local.js` is no longer being used
   for anything — you can leave it there as a fallback or remove it once
   you're confident the proxy is solid.

### What I could NOT test here either

Same honesty as above: I wrote `supabase/functions/tts-proxy/index.ts`
against Supabase's documented Edge Functions API (Deno runtime, standard
`Deno.serve` handler), and it mirrors the exact request/response shape
`app/tts.js` already sends successfully to ElevenLabs directly — but I have
no deployed function to hit. First real test is yours, step 6 above.

## Rollback

Everything is additive and gated behind config values. To fully undo either
part, just blank out the corresponding `config.local.js` values and reload —
the app falls back to its current behavior (localStorage, direct key) with
no code changes needed.
