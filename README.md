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
- `supabase/schema.sql` — production Postgres schema + RLS (not yet provisioned; app runs in localStorage demo mode).
- `app/`
  - `data.js` — word library (8 sets × 6 words for beta; PRD targets 24×8) with SFA features + cue ladders.
  - `engine.js` — pure logic: SM-2-adapted SRS (L0–L1 advances, L2–L3 holds, L4 resets), FLOW/STRAIN/FATIGUE state machine, between-session dose planner.
  - `store.js` — persistence adapter (localStorage now, Supabase later — same interface).
  - `tts.js` — TTS provider adapter. Uses ElevenLabs if a key is configured in `config.local.js`, else falls back to the Web Speech API automatically (no crash, just the robotic browser voice).
  - `config.local.example.js` — copy to `config.local.js` (gitignored) and fill in an ElevenLabs key from the **ElevenCreative** workspace with Text-to-Speech permission enabled at creation — see comments in `tts.js` for the exact failure mode if that permission is missing.
  - `app.js` — UI: onboarding, session flow, summary, progress, caregiver dashboard + weekly 5-item check-in.

## Design invariants (do not break)

1. No card and no session ever ends in a visible failure state (errorless-learning principle).
2. Touch targets ≥ 44px; one primary action per screen; no visible timers or mid-exercise scores.
3. The SRS algorithm is never surfaced to the patient.
4. Fatigue-shortened sessions are framed as completions ("great stopping point"), never as quitting.
5. Max 4 new words per session, only when the review queue is small.
6. Spoken guidance is short and calm; full instructions only on the first card of a session (brief after), so voice prompts never become noise. The guided tutorial auto-runs once after onboarding and is replayable from Home ("Replay the tutorial").

## Migration path

- **Supabase:** implement `store.js`'s interface against the schema in `supabase/schema.sql`; RLS is already written for patient/caregiver roles.
- **React Native:** `engine.js`/`store.js`/`data.js` are framework-free; only `app.js` needs porting.
- **ElevenLabs:** add a second provider in `tts.js` behind the `speak(text)` interface; flip `PROVIDER`.

## Phase 1 beta success criteria (from PRD §9)

Daily return ≥60% over 4 weeks · mean cue depth declining on reviewed items ·
caregiver dashboard opened weekly unprompted · zero visible failure states.
