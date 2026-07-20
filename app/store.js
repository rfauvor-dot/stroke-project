// Reclaim — persistence adapter. localStorage is always the source of truth
// for reads (instant, offline-safe); if cloud sync is configured and the
// device is signed in, writes are also mirrored to Supabase in the
// background (see cloud.js for why this is a mirror, not a replacement).

import * as cloud from "./cloud.js";

const KEY = "reclaim_v1";

// Set once after sign-in/link (see app.js's cloud-sync setup flow). Null on
// any device that hasn't opted in — save()/checkin still work identically,
// just localStorage-only, exactly like before this feature existed.
let cloudIds = { patientId: null, caregiverId: null };
export function setCloudIdentity(ids) { cloudIds = { ...cloudIds, ...ids }; }
export function getCloudIdentity() { return cloudIds; }

const DEFAULTS = {
  profile: { name: "", severity: 2, sessionTargetMin: 10, onboarded: false, caregiverName: "" },
  srs: {},          // wordId -> srs state
  sessions: [],     // {id, date, startedAt, endedAt, plannedMin, endState, attempts: n, l0l1: n, meanLatency, meanCue}
  attempts: [],     // {sessionId, wordId, cueLevel, hintsUsed, latencyMs, selfScoredSuccess, date, createdAt}
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

export function save(db) {
  localStorage.setItem(KEY, JSON.stringify(db));
  syncToCloudInBackground(db); // fire-and-forget; no-ops if cloud sync isn't configured/linked
}

// Incremental push cursor — avoids re-sending the entire local history on
// every save() call (which happens after nearly every user action).
const cloudCursor = { attemptsPushed: 0, srsPushed: {}, checkinsPushed: 0 };

function syncToCloudInBackground(db) {
  if (!cloud.cloudAvailable || !cloudIds.patientId) return;
  const pid = cloudIds.patientId;

  if (db.sessions.length) cloud.pushSession(pid, db.sessions[db.sessions.length - 1]);

  const newAttempts = db.attempts.slice(cloudCursor.attemptsPushed);
  if (newAttempts.length) {
    cloud.pushAttempts(pid, newAttempts);
    cloudCursor.attemptsPushed = db.attempts.length;
  }

  for (const [wordId, srs] of Object.entries(db.srs)) {
    if (cloudCursor.srsPushed[wordId] !== srs.reps) {
      cloud.pushSrsState(pid, Number(wordId), srs);
      cloudCursor.srsPushed[wordId] = srs.reps;
    }
  }

  if (cloudIds.caregiverId) {
    const newCheckins = db.checkins.slice(cloudCursor.checkinsPushed);
    for (const ci of newCheckins) cloud.pushCheckin(pid, cloudIds.caregiverId, ci);
    if (newCheckins.length) cloudCursor.checkinsPushed = db.checkins.length;
  }
}

// Called once at boot if signed in (see app.js). Pulls the cloud copy and
// merges it into the local db — conservative merge (never drops local data
// that hasn't synced yet), so this is what lets a caregiver's device see
// sessions done on the patient's phone, and vice versa after a re-open.
export async function syncFromCloud() {
  if (!cloud.cloudAvailable || !cloudIds.patientId) return null;
  const remote = await cloud.pullAll(cloudIds.patientId);
  if (!remote) return null;

  const db = load();
  for (const s of remote.sessions) {
    const i = db.sessions.findIndex(x => x.id === s.id);
    if (i >= 0) db.sessions[i] = s; else db.sessions.push(s);
  }
  db.sessions.sort((a, b) => a.startedAt - b.startedAt);

  for (const [wordId, srs] of Object.entries(remote.srs)) {
    const local = db.srs[wordId];
    if (!local || (srs.reps ?? 0) >= (local.reps ?? 0)) db.srs[wordId] = srs;
  }

  const localWeeks = new Set(db.checkins.map(c => c.weekStart));
  for (const ci of remote.checkins) if (!localWeeks.has(ci.weekStart)) db.checkins.push(ci);

  save(db);
  return db;
}

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
