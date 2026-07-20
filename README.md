# Reclaim — Stroke Recovery Speech Practice (Phase 1 MVP)

Daily Semantic Feature Analysis word practice with post-stroke-adapted spaced repetition,
a fatigue-aware adaptive intensity engine, and a caregiver companion view.

## Run it

No build step, no dependencies:

```
python -m http.server 8317 --directory app
```

Open http://localhost:8317 (mobile-first; on a phone, use the PC's LAN IP).

## Layout

- `PRD.md` — full product spec: flows, exercise engine, adaptive algorithm, outcome proxies, roadmap.
- `SUPABASE_SETUP.md` — how to activate cloud sync + the TTS proxy (both built, both inert until configured — see below).
- `supabase/schema.sql` — production Postgres schema + RLS. Not yet provisioned; app runs in localStorage demo mode until `SUPABASE_URL`/`SUPABASE_ANON_KEY` are set.
- `supabase/functions/tts-proxy/` — Edge Function that holds the ElevenLabs key server-side; `tts.js` uses it automatically once `TTS_PROXY_URL` is set.
- `app/`
  - `data.js` — word library (48 words across 8 sets) with SFA features + cue ladders.
  - `engine.js` — pure logic: SM-2-adapted SRS (L0–L1 advances, L2–L3 holds, L4 resets), FLOW/STRAIN/FATIGUE state machine, between-session dose planner.
  - `store.js` — persistence adapter. localStorage is always the source of truth for reads (instant, offline-safe); `cloud.js` mirrors writes to Supabase in the background when configured + signed in. See `SUPABASE_SETUP.md` for why this is a mirror, not a rewrite of the synchronous call sites in `app.js`.
  - `cloud.js` — Supabase client, magic-link auth, and the push/pull functions mapping the local db shape to `schema.sql`'s tables. Every export no-ops safely when unconfigured.
  - `tts.js` — TTS provider adapter. Prefers a server-side proxy (`TTS_PROXY_URL`) if set; else calls ElevenLabs directly with a client-side key if configured; else falls back to the Web Speech API automatically (no crash, just the robotic browser voice).
  - `config.local.example.js` — copy to `config.local.js` (gitignored). ElevenLabs key from the **ElevenCreative** workspace with Text-to-Speech permission enabled at creation — see comments in `tts.js` for the exact failure mode if that permission is missing. Supabase/proxy fields documented in `SUPABASE_SETUP.md`.
  - `review.html` — live visual audit grid of all 48 words + current pictures, pulled from the same modules the app uses. Open at `/review.html`.
  - `app.js` — UI: onboarding, session flow, summary, progress, caregiver dashboard, cloud-sync opt-in cards, weekly 5-item check-in.

## Design invariants (do not break)

1. No card and no session ever ends in a visible failure state (errorless-learning principle).
2. Touch targets ≥ 44px; one primary action per screen; no visible timers or mid-exercise scores.
3. The SRS algorithm is never surfaced to the patient.
4. Fatigue-shortened sessions are framed as completions ("great stopping point"), never as quitting.
5. Max 4 new words per session, only when the review queue is small.
6. Spoken guidance is short and calm; full instructions only on the first card of a session (brief after), so voice prompts never become noise. The guided tutorial auto-runs once after onboarding and is replayable from Home ("Replay the tutorial").

## Migration path

- **Supabase:** built, see `SUPABASE_SETUP.md` to activate.
- **React Native:** `engine.js`/`store.js`/`data.js`/`cloud.js` are framework-free; only `app.js` needs porting.
- **ElevenLabs server-side proxy:** built (`supabase/functions/tts-proxy`), see `SUPABASE_SETUP.md` to deploy.

## Phase 1 beta success criteria (from PRD §9)

Daily return ≥60% over 4 weeks · mean cue depth declining on reviewed items ·
caregiver dashboard opened weekly unprompted · zero visible failure states.
