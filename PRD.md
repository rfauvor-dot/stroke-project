# Stroke Recovery App — Product Requirements Document (Phase 1 MVP)

**Working name:** Reclaim
**Version:** 1.0 · July 2026
**Scope:** Phase 1 — Semantic Feature Analysis (SFA) + Spaced Repetition + Caregiver Companion
**First user:** Rick's wife (post-stroke, speech + memory therapy graduate, 175% improvement from baseline)

---

## 1. Product thesis

Formal speech therapy delivers 1–3 sessions/week. The evidence-based optimal dose is daily effortful practice. Reclaim fills the gap between appointments with clinically grounded SFA word-retrieval exercises, scheduled by an adaptive spaced-repetition system, tuned in real time by a fatigue-aware intensity engine, and reinforced by a caregiver companion layer — the single strongest predictor of home-practice adherence.

**Non-goals for Phase 1:** memory-training modules, clinician portal, AI conversation partner, social features, insurance/HIPAA claims. Deliberate narrowness; validate daily retention first.

---

## 2. Users & flows

### 2.1 Patient (primary)
1. **Onboarding** (one-time, caregiver may assist): name, aphasia self-screener (fluent/non-fluent, severity 1–4 self-report), personal vocabulary seeds (family names, hobbies, occupation — used to prioritize word sets), TTS voice preview.
2. **Daily session loop:**
   - Home screen → single primary action: "Start today's practice" (streak + last-session summary visible, no scores).
   - Session = queue of SFA exercise cards (target 10–15 min, adaptive; see §4).
   - Each card: image + semantic feature prompts → naming attempt → cue ladder if needed → success framing.
   - Session ends **on a success item** (engine guarantees the final item is one at/below mastery level).
   - Post-session summary: words practiced, words strengthening, streak. Quiet, adult-respecting.
3. **Progress screen:** cumulative arc (words recovered over time), streak, session count. Narrative framing ("You can now retrieve 47 words you couldn't at the start"), never raw error rates.

### 2.2 Caregiver (secondary)
1. Linked at onboarding via a share code.
2. **Dashboard:** adherence calendar, session history, fatigue-event log ("Tuesday's session was shortened — that's the app protecting against overload, not a failure"), functional-communication trend.
3. **Weekly 5-item functional communication check-in** (CADL-2-aligned proxy, §5.3).
4. **Alert:** patient inactive 3+ days → one gentle notification. Never daily nagging.

### 2.3 Clinician (Phase 3 — out of scope; schema reserves for it)

---

## 3. Exercise engine — SFA implementation

### 3.1 Card anatomy (per target word)
1. **Image shown**, word withheld. TTS reads the prompt.
2. **Feature elicitation** (semantic cueing, in evidence order): *category* → *use/function* → *properties* (color/size) → *location* → *association*. Patient taps/selects or self-generates; each engaged feature is itself therapeutic (builds the semantic network), so features are never "skipped for speed."
3. **Naming attempt:** patient says the word aloud (self-scored tap: "Got it" / "Not yet" — no speech recognition in Phase 1; self-report + caregiver spot-checks are the validated low-friction pattern).
4. **Cue ladder** if not retrieved (least→most support):
   L0 none → L1 semantic sentence frame ("You drink coffee from a ___") → L2 first phoneme ("It starts with /k/") → L3 written word shown, read together → L4 TTS says word, patient repeats (errorless completion).
   Cue level reached = the key per-item difficulty datum.
5. **Success framing:** every card ends in production of the word (at worst L4 repetition) — errorless-learning principle; no card ends in failure.

### 3.2 Word library (Phase 1)
- **24 curated word sets** × 8 words = 192 items. Sets grouped by semantic category and personal relevance tier: household, food/kitchen, family & people, clothing, outdoors, health/daily care, hobbies (customized), community places.
- Personal vocabulary from onboarding is injected into matching sets first.
- Concreteness and frequency graded: each set has easy (high-frequency, high-imageability) → hard bands.

### 3.3 Spaced repetition (post-stroke adapted)
Modified SM-2 with stroke-specific conservatism:
- Intervals: 1d → 2d → 4d → 7d → 14d → 30d (cap 30d in Phase 1).
- **Success at cue level L0–L1** advances the interval; **L2–L3 holds** the interval; **L4 resets** to 1d.
- Recent-weighted: last 3 outcomes count double vs. history (post-stroke learning rates are unstable; don't trust old data).
- New-item introduction throttled: max 4 new words/session, and only when review queue < 10.
- Never exposed to the user; presented as "words coming up for review."

---

## 4. Adaptive Intensity Engine (the differentiator)

Runs **within-session** (real-time fatigue response) and **between-session** (dose planning).

### 4.1 Signals
| Signal | Measure | Fatigue indicator |
|---|---|---|
| Response latency | ms from prompt to first interaction, EWMA per session | Rising >40% above patient's session baseline |
| Cue depth | Average cue level this session vs. patient's 7-day norm | +1.0 level above norm |
| Error clustering | 3 consecutive items at L3+ | Immediate trigger |
| Session engagement | Idle >45s on a card; app backgrounded | Soft trigger |

### 4.2 Within-session policy (state machine)
- **FLOW** (default): normal queue.
- **STRAIN** (any one signal): drop set size — remaining queue trimmed 30%, next items selected from patient's mastered band (confidence restoration), cue ladder starts at L1 pre-support.
- **FATIGUE** (two signals, or error-cluster trigger): end session early *gracefully* — serve one guaranteed-success item, then summary. Framed as completion, never as failure ("Great stopping point — 9 words today").
- Hysteresis: STRAIN→FLOW only after 3 consecutive L0–L1 successes.

### 4.3 Between-session policy
- Session length target starts at 10 min; +1 min/week of ≥80% completion-rate weeks, cap 20 min (Phase 1).
- Two FATIGUE endings in a week → next-week target −20%, new-word introduction paused.
- Baseline latency recalibrated weekly (recovery changes the baseline; last week's "slow" is this week's normal).

---

## 5. Clinical outcome proxies (tracked, never test-labeled)

| Proxy | Maps to | Storage |
|---|---|---|
| Naming accuracy at L0–L1 over time | WAB-R naming/AQ trajectory | per-item attempts |
| Response latency trend | Processing/retrieval strength (BDAE fluency proxy) | per-attempt ms |
| Mean cue depth per session (declining = recovery) | Cueing-hierarchy independence | per-attempt cue level |
| Session completion rate | Adherence → real-world recovery predictor | sessions table |
| Caregiver 5-item weekly scale | CADL-2 functional communication | checkins table |

**Caregiver 5-item scale** (0–4 each, weekly): 1. Makes needs known without frustration · 2. Joins family conversation · 3. Uses names of people/objects spontaneously · 4. Handles a phone call or greeting · 5. Frustration level when word-finding (reverse-scored).

---

## 6. Data model (Supabase / PostgreSQL)

See `supabase/schema.sql`. Tables: `profiles` (patient/caregiver/clinician role, link codes), `word_sets`, `words` (incl. personal words), `srs_state` (per patient×word: interval, due date, ease), `sessions` (start/end, planned vs. actual length, end state FLOW/STRAIN/FATIGUE), `attempts` (session, word, cue level reached, latency ms, self-scored result), `caregiver_checkins` (5-item scale), `alerts`. RLS: patients see own rows; caregivers see linked patient's aggregates.

---

## 7. Tech stack

- **Frontend:** React (Vite) — mobile-first responsive web app for Phase 1 (fastest path to first-user testing; React Native port in Phase 2 if retention validates). Accessibility hard rules: ≥44px touch targets, single-action screens, no timers visible, no failure states, WCAG AA contrast.
- **Backend:** Supabase (Postgres + Auth + Realtime) directly from client for Phase 1; Node/Express layer added when clinician portal needs server-side logic.
- **TTS:** provider adapter — `speak(text)` interface; Web Speech API implementation now (zero-key testing), ElevenLabs implementation slot-in behind the same interface for production voice quality.
- **Persistence in demo mode:** localStorage mirror of the schema so the app is fully testable before Supabase credentials exist.

## 8. Clinical credibility

Every exercise screen footer: "Semantic Feature Analysis — evidence-based treatment for anomia after stroke." Progress screen links to a plain-language "The science behind Reclaim" page citing the research brief.

## 9. Success criteria (Phase 1 beta, n=1 → n≈10)

1. Daily return rate ≥60% over 4 weeks (first user), then cohort.
2. Mean cue depth declines over 4 weeks on reviewed items.
3. Caregiver dashboard opened ≥1×/week without prompting.
4. Zero sessions ending in a visible failure state (engine invariant).
