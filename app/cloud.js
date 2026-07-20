// Reclaim — Supabase cloud sync. Local-first, additive, off by default.
//
// WHY THIS ARCHITECTURE: app.js's session/exercise logic is synchronous —
// it mutates `db` in memory and calls store.save(db) directly, hundreds of
// times across the file, and that code is tested and working. Rewriting all
// of it to async/await against a live network call, overnight, with no real
// Supabase project to test against, is how you turn a working app into a
// broken one by morning. Instead: localStorage stays the source of truth
// for instant, offline-safe reads/writes (unchanged); this module mirrors
// writes to Supabase in the background (fire-and-forget, never blocks the
// UI, never throws into caller code) and pulls remote state down once at
// boot + on demand, handing back a plain db-shaped object for store.js to
// merge. No existing call site in app.js needed to change.
//
// OFF BY DEFAULT: every export here no-ops safely if config.local.js has no
// SUPABASE_URL/SUPABASE_ANON_KEY. The app behaves identically to today
// until Rick provisions a project and opts in — see SUPABASE_SETUP.md.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.local.js";

const configured = !!SUPABASE_URL && !!SUPABASE_ANON_KEY
  && SUPABASE_URL !== "REPLACE_ME" && SUPABASE_ANON_KEY !== "REPLACE_ME";

export const cloudAvailable = configured;

let client = null;
let clientPromise = null;

// Lazy + cached: only fetch the Supabase SDK over the network if actually
// configured, so an unconfigured install never makes an external request.
async function getClient() {
  if (!configured) return null;
  if (client) return client;
  if (!clientPromise) {
    clientPromise = import("https://esm.sh/@supabase/supabase-js@2").then(mod => {
      client = mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      return client;
    });
  }
  return clientPromise;
}

// ── Auth ─────────────────────────────────────────────────────────
// Magic-link email, deliberately no password: one less form field and one
// less thing to remember/mistype for a patient with word-finding difficulty.
// Optional — skipping it just means this device stays localStorage-only,
// same as today.
export async function currentUser() {
  const c = await getClient();
  if (!c) return null;
  const { data } = await c.auth.getUser();
  return data?.user ?? null;
}

export async function sendMagicLink(email) {
  const c = await getClient();
  if (!c) throw new Error("Cloud sync isn't configured on this device.");
  const { error } = await c.auth.signInWithOtp({ email, options: { emailRedirectTo: location.href } });
  if (error) throw error;
}

export async function signOut() {
  const c = await getClient();
  if (c) await c.auth.signOut();
}

export function onAuthChange(cb) {
  getClient().then(c => { if (c) c.auth.onAuthStateChange((_event, session) => cb(session?.user ?? null)); });
}

// ── Profile / role setup ────────────────────────────────────────
// role: "patient" | "caregiver". Patients get a link_code generated for
// caregivers to redeem; caregivers redeem a code to set linked_patient_id.
function genLinkCode() {
  return Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");
}

export async function ensureProfile(role, displayName) {
  const c = await getClient();
  if (!c) return null;
  const user = await currentUser();
  if (!user) return null;
  const { data: existing } = await c.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) return existing;
  const row = {
    id: user.id, role, display_name: displayName,
    link_code: role === "patient" ? genLinkCode() : null,
  };
  const { data, error } = await c.from("profiles").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function linkToPatient(linkCode) {
  const c = await getClient();
  if (!c) throw new Error("Cloud sync isn't configured.");
  const user = await currentUser();
  if (!user) throw new Error("Not signed in.");
  const { data: patient, error: findErr } = await c.from("profiles")
    .select("id, display_name").eq("link_code", linkCode.trim().toUpperCase()).eq("role", "patient").maybeSingle();
  if (findErr) throw findErr;
  if (!patient) throw new Error("That code didn't match anyone. Double-check it with the person you're supporting.");
  const { error } = await c.from("profiles").update({ linked_patient_id: patient.id }).eq("id", user.id);
  if (error) throw error;
  return patient;
}

// ── Push: mirror the local db blob into normalized cloud tables ────
// Fire-and-forget from store.js's save(). Errors are logged, never thrown —
// a flaky connection must never block or corrupt the local session.
export async function pushSession(patientId, sessionRow) {
  const c = await getClient();
  if (!c || !patientId) return;
  try {
    await c.from("sessions").upsert({
      id: sessionRow.id, patient_id: patientId,
      started_at: new Date(sessionRow.startedAt).toISOString(),
      ended_at: sessionRow.endedAt ? new Date(sessionRow.endedAt).toISOString() : null,
      planned_minutes: sessionRow.plannedMin, end_state: sessionRow.endState,
      words_attempted: sessionRow.attempts, words_l0l1: sessionRow.l0l1,
      mean_latency_ms: sessionRow.meanLatency, mean_cue_level: sessionRow.meanCue,
    });
  } catch (err) { console.error("[cloud] pushSession failed:", err.message); }
}

export async function pushAttempts(patientId, attemptRows) {
  const c = await getClient();
  if (!c || !patientId || !attemptRows.length) return;
  try {
    await c.from("attempts").insert(attemptRows.map(a => ({
      session_id: a.sessionId, patient_id: patientId, word_id: a.wordId,
      cue_level: a.cueLevel, latency_ms: a.latencyMs, self_scored_success: a.selfScoredSuccess,
      created_at: new Date(a.createdAt).toISOString(),
    })));
  } catch (err) { console.error("[cloud] pushAttempts failed:", err.message); }
}

export async function pushSrsState(patientId, wordId, srs) {
  const c = await getClient();
  if (!c || !patientId) return;
  try {
    await c.from("srs_state").upsert({
      patient_id: patientId, word_id: wordId, interval_days: srs.intervalIdx,
      due_date: srs.dueDate, reps: srs.reps, recent_outcomes: srs.recent, mastered: srs.mastered,
    });
  } catch (err) { console.error("[cloud] pushSrsState failed:", err.message); }
}

export async function pushCheckin(patientId, caregiverId, checkin) {
  const c = await getClient();
  if (!c || !patientId || !caregiverId) return;
  try {
    await c.from("caregiver_checkins").upsert({
      caregiver_id: caregiverId, patient_id: patientId, week_start: checkin.weekStart,
      q1_needs: checkin.scores[0], q2_conversation: checkin.scores[1],
      q3_spontaneous_naming: checkin.scores[2], q4_phone_greeting: checkin.scores[3],
      q5_frustration_rev: checkin.scores[4],
    }, { onConflict: "patient_id,week_start" });
  } catch (err) { console.error("[cloud] pushCheckin failed:", err.message); }
}

// ── Pull: reconstruct a db-shaped object from cloud tables ─────────
// Used once at boot (if signed in) to merge with/override local cache —
// this is what lets Care Partner see sessions done on Bella's phone.
export async function pullAll(patientId) {
  const c = await getClient();
  if (!c || !patientId) return null;
  try {
    const [sessionsRes, srsRes, checkinsRes] = await Promise.all([
      c.from("sessions").select("*").eq("patient_id", patientId).order("started_at"),
      c.from("srs_state").select("*").eq("patient_id", patientId),
      c.from("caregiver_checkins").select("*").eq("patient_id", patientId).order("week_start"),
    ]);
    if (sessionsRes.error) throw sessionsRes.error;
    const sessions = (sessionsRes.data ?? []).map(s => ({
      id: s.id, date: s.started_at.slice(0, 10), startedAt: +new Date(s.started_at),
      endedAt: s.ended_at ? +new Date(s.ended_at) : null, plannedMin: s.planned_minutes,
      endState: s.end_state, attempts: s.words_attempted, l0l1: s.words_l0l1,
      meanLatency: s.mean_latency_ms, meanCue: s.mean_cue_level,
    }));
    const srs = {};
    for (const row of srsRes.data ?? []) {
      srs[row.word_id] = {
        wordId: row.word_id, intervalIdx: row.interval_days, dueDate: row.due_date,
        reps: row.reps, recent: row.recent_outcomes ?? [], mastered: row.mastered,
      };
    }
    const checkins = (checkinsRes.data ?? []).map(ci => ({
      weekStart: ci.week_start,
      scores: [ci.q1_needs, ci.q2_conversation, ci.q3_spontaneous_naming, ci.q4_phone_greeting, ci.q5_frustration_rev],
      total: ci.q1_needs + ci.q2_conversation + ci.q3_spontaneous_naming + ci.q4_phone_greeting + ci.q5_frustration_rev,
    }));
    return { sessions, srs, checkins };
  } catch (err) {
    console.error("[cloud] pullAll failed:", err.message);
    return null;
  }
}
