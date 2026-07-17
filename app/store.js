// Reclaim — persistence adapter. Phase 1 demo mode: localStorage mirror of the Supabase schema.
// Swap `backend` for a Supabase implementation with the same interface when credentials exist.

const KEY = "reclaim_v1";

const DEFAULTS = {
  profile: { name: "", severity: 2, sessionTargetMin: 10, onboarded: false, caregiverName: "" },
  srs: {},          // wordId -> srs state
  sessions: [],     // {id, date, startedAt, endedAt, plannedMin, endState, attempts: n, l0l1: n, meanLatency, meanCue}
  attempts: [],     // {sessionId, wordId, cueLevel, latencyMs, date}
  checkins: [],     // {weekStart, scores:[5], total}
  streak: { count: 0, lastDate: null },
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
  } catch {}
  return structuredClone(DEFAULTS);
}

export function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }

export function bumpStreak(db, dateStr) {
  const { streak } = db;
  if (streak.lastDate === dateStr) return db;
  const yest = new Date(dateStr + "T00:00:00"); yest.setDate(yest.getDate() - 1);
  const yStr = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, "0")}-${String(yest.getDate()).padStart(2, "0")}`;
  db.streak = { count: streak.lastDate === yStr ? streak.count + 1 : 1, lastDate: dateStr };
  return db;
}

// ── derived metrics for progress + caregiver views ────────────────
export function wordsRecovered(db) {
  return Object.values(db.srs).filter(s => s.mastered).length;
}

export function recentSessions(db, n = 14) { return db.sessions.slice(-n); }

export function meanCueTrend(db) {
  // per-session mean cue level, oldest→newest
  return db.sessions.map(s => ({ date: s.date, meanCue: s.meanCue ?? null })).filter(x => x.meanCue != null);
}

export function norm7dCue(db) {
  const last = db.sessions.slice(-7).map(s => s.meanCue).filter(x => x != null);
  return last.length ? last.reduce((a, b) => a + b, 0) / last.length : 1.0;
}

export function adherenceCalendar(db, days = 28) {
  const out = [];
  const d = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(d); dt.setDate(d.getDate() - i);
    const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const ses = db.sessions.filter(s => s.date === ds);
    out.push({ date: ds, sessions: ses.length, fatigue: ses.some(s => s.endState === "fatigue") });
  }
  return out;
}

export function daysInactive(db) {
  if (!db.sessions.length) return null;
  const last = new Date(db.sessions[db.sessions.length - 1].date + "T00:00:00");
  return Math.floor((Date.now() - last.getTime()) / 86400000);
}
