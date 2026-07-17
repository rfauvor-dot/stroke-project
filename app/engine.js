// Reclaim — core engine: spaced repetition (post-stroke adapted SM-2) + adaptive intensity state machine.
// Pure logic, no DOM. Mirrors supabase/schema.sql shapes so it ports to a server unchanged.

export const CUE = { NONE: 0, FRAME: 1, PHONEME: 2, WRITTEN: 3, REPEAT: 4 };
export const STATE = { FLOW: "flow", STRAIN: "strain", FATIGUE: "fatigue" };

const INTERVALS = [1, 2, 4, 7, 14, 30]; // days, capped at 30 for Phase 1

// ── Spaced repetition ─────────────────────────────────────────────
export function newSrsState(wordId) {
  return { wordId, intervalIdx: 0, dueDate: today(), reps: 0, recent: [], mastered: false };
}

export function recordOutcome(srs, cueLevel) {
  const s = { ...srs, reps: srs.reps + 1, recent: [...srs.recent.slice(-2), cueLevel] };
  if (cueLevel <= CUE.FRAME) {
    s.intervalIdx = Math.min(s.intervalIdx + 1, INTERVALS.length - 1);
  } else if (cueLevel >= CUE.REPEAT) {
    s.intervalIdx = 0; // full reset — errorless completion needed
  } // L2–L3 holds the interval
  s.mastered = s.recent.length === 3 && s.recent.every(c => c <= CUE.FRAME);
  s.dueDate = addDays(today(), INTERVALS[s.intervalIdx]);
  return s;
}

export function buildQueue(allWords, srsMap, maxItems) {
  const t = today();
  const due = [], fresh = [], mastered = [];
  for (const w of allWords) {
    const s = srsMap[w.id];
    if (!s) fresh.push(w);
    else if (s.mastered) mastered.push(w);
    else if (s.dueDate <= t) due.push(w);
  }
  // reviews first (easy→hard), then throttled new items (max 4, only if review queue small)
  due.sort((a, b) => a.difficulty - b.difficulty);
  fresh.sort((a, b) => a.difficulty - b.difficulty);
  const newAllowance = due.length < 10 ? 4 : 0;
  const queue = [...due, ...fresh.slice(0, newAllowance)].slice(0, maxItems);
  // top up from mastered if under-filled, and reserve a guaranteed-success closer
  while (queue.length < Math.min(maxItems, 6) && mastered.length) queue.push(mastered.shift());
  return { queue, masteredPool: mastered };
}

// ── Adaptive intensity (within-session) ───────────────────────────
export function createIntensityMonitor() {
  return {
    state: STATE.FLOW,
    latencies: [], baselineEwma: null, ewma: null,
    cueLevels: [], consecHighCue: 0, consecEasySuccess: 0,
    events: [],
  };
}

export function observeAttempt(m, { latencyMs, cueLevel }, norm7dCue = 1.0) {
  const mon = { ...m, latencies: [...m.latencies, latencyMs], cueLevels: [...m.cueLevels, cueLevel] };
  const a = 0.4;
  mon.ewma = mon.ewma == null ? latencyMs : a * latencyMs + (1 - a) * mon.ewma;
  if (mon.latencies.length === 3) mon.baselineEwma = mon.ewma; // first 3 items set session baseline
  mon.consecHighCue = cueLevel >= CUE.WRITTEN ? mon.consecHighCue + 1 : 0;
  mon.consecEasySuccess = cueLevel <= CUE.FRAME ? mon.consecEasySuccess + 1 : 0;

  let signals = 0;
  if (mon.baselineEwma && mon.ewma > mon.baselineEwma * 1.4) signals++;
  const meanCue = mon.cueLevels.reduce((x, y) => x + y, 0) / mon.cueLevels.length;
  if (mon.cueLevels.length >= 4 && meanCue > norm7dCue + 1.0) signals++;
  const errorCluster = mon.consecHighCue >= 3;

  if (errorCluster || signals >= 2) {
    if (mon.state !== STATE.FATIGUE) mon.events.push({ t: Date.now(), to: STATE.FATIGUE });
    mon.state = STATE.FATIGUE;
  } else if (signals === 1 && mon.state === STATE.FLOW) {
    mon.state = STATE.STRAIN;
    mon.events.push({ t: Date.now(), to: STATE.STRAIN });
  } else if (mon.state === STATE.STRAIN && mon.consecEasySuccess >= 3) {
    mon.state = STATE.FLOW; // hysteresis: recover only after 3 easy successes
    mon.events.push({ t: Date.now(), to: STATE.FLOW });
  }
  return mon;
}

// Queue adjustment when entering STRAIN: trim 30%, refill from mastered pool for confidence.
export function applyStrain(queueRemaining, masteredPool) {
  const keep = Math.max(2, Math.ceil(queueRemaining.length * 0.7));
  const trimmed = queueRemaining.slice(0, keep);
  const boost = masteredPool.slice(0, 2);
  return [...boost, ...trimmed.filter(w => !boost.includes(w))];
}

// ── Between-session dose planning ─────────────────────────────────
export function planNextTarget(profile, weekSessions) {
  let target = profile.sessionTargetMin ?? 10;
  const fatigueEndings = weekSessions.filter(s => s.endState === STATE.FATIGUE).length;
  const completion = weekSessions.length
    ? weekSessions.filter(s => s.endState === STATE.FLOW).length / weekSessions.length : 0;
  if (fatigueEndings >= 2) target = Math.max(6, Math.round(target * 0.8));
  else if (weekSessions.length >= 5 && completion >= 0.8) target = Math.min(20, target + 1);
  return target;
}

// ── helpers ───────────────────────────────────────────────────────
// Local calendar dates, not UTC — an evening session must not be stamped with tomorrow's date.
export function localDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function today() { return localDate(); }
export function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return localDate(d);
}
