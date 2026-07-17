// Reclaim — UI layer. Views: onboarding, home, session (SFA card flow), summary, progress, caregiver.
import { WORDS } from "./data.js";
import * as eng from "./engine.js";
import * as db_ from "./store.js";
import { speak, getTtsDiagnostics } from "./tts.js";
import { pictureHtml } from "./icons.js";
import { checkReminders, requestNotificationPermission, notificationPermission, notificationsSupported } from "./notifications.js";

// Spoken guidance — short, calm coaching prompts layered on the existing TTS.
// Delay avoids colliding with content speech (cues, revealed features).
function guide(text, delayMs = 0) {
  if (delayMs) setTimeout(() => speak(text, { rate: 0.9 }), delayMs);
  else speak(text, { rate: 0.9 });
}

let db = db_.load();
const app = document.getElementById("app");
const nav = document.getElementById("nav");
let session = null; // active session state

// ── router ────────────────────────────────────────────────────────
function go(view) {
  nav.hidden = view === "session" || !db.profile.onboarded;
  app.classList.toggle("no-nav", nav.hidden);
  nav.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  views[view]();
}
nav.addEventListener("click", e => {
  const b = e.target.closest("button[data-view]");
  if (b) go(b.dataset.view);
});

// crypto.randomUUID is unavailable outside secure contexts (e.g. phone → http://LAN-IP)
const uid = () => crypto.randomUUID?.() ??
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
  });

const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// ── views ─────────────────────────────────────────────────────────
const views = {
  onboarding() {
    app.innerHTML = `
      <div style="padding-top:2rem">
        <h1>Welcome to Reclaim</h1>
        <p class="muted" style="margin-top:0.5rem">Daily word practice built on Semantic Feature Analysis — an evidence-based speech therapy for word-finding after stroke.</p>
        <div class="card">
          <label><b>Your first name</b><input type="text" id="ob-name" autocomplete="off"></label>
          <label style="display:block;margin-top:1rem"><b>Care partner's name</b> <span class="muted small">(optional)</span><input type="text" id="ob-cg" autocomplete="off"></label>
          <p style="margin-top:1rem"><b>How hard is word-finding right now?</b></p>
          <div class="scale-row" id="ob-sev">
            <button data-v="1">A little</button><button data-v="2" class="sel">Sometimes</button>
            <button data-v="3">Often</button><button data-v="4">Very hard</button>
          </div>
          <button class="btn btn-primary" id="ob-go">Start my practice</button>
        </div>
        <p class="evidence-note">Boyle & Coelho (1995) and 20+ subsequent studies support SFA for anomia after stroke.</p>
      </div>`;
    let sev = 2;
    document.getElementById("ob-sev").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      sev = +b.dataset.v;
      document.querySelectorAll("#ob-sev button").forEach(x => x.classList.toggle("sel", x === b));
    });
    document.getElementById("ob-go").addEventListener("click", () => {
      db.profile = { ...db.profile, name: document.getElementById("ob-name").value.trim() || "Friend",
        caregiverName: document.getElementById("ob-cg").value.trim(), severity: sev,
        sessionTargetMin: sev >= 3 ? 8 : 10, onboarded: true };
      db_.save(db); go("tutorial");
    });
  },

  home() {
    const recovered = db_.wordsRecovered(db);
    const doneToday = db.sessions.some(s => s.date === eng.today());
    app.innerHTML = `
      <div style="padding-top:1.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h1>Hello, ${esc(db.profile.name)}</h1>
          <span class="streak-badge">🔥 ${db.streak.count} day${db.streak.count === 1 ? "" : "s"}</span>
        </div>
        ${doneToday
          ? `<div class="card"><h2>Today's practice is done ✓</h2><p class="muted" style="margin-top:0.5rem">Well done. Your words are getting stronger. Come back tomorrow — or do a bonus round if you feel up to it.</p><button class="btn btn-secondary" id="start">Bonus practice</button></div>`
          : `<div class="card"><h2>Ready for today's words?</h2><p class="muted" style="margin-top:0.5rem">About ${db.profile.sessionTargetMin} minutes. The app adjusts to how you're feeling — you can stop any time and it still counts.</p><button class="btn btn-primary" id="start">Start today's practice</button></div>`}
        <div class="stat-grid">
          <div class="stat"><b>${recovered}</b><span>words recovered</span></div>
          <div class="stat"><b>${db.sessions.length}</b><span>sessions completed</span></div>
        </div>
        ${notificationsSupported() ? `<div class="card" id="reminders-card"></div>` : ""}
        <button class="btn btn-quiet" id="replay-tut">Replay the tutorial</button>
        <p class="evidence-note">Semantic Feature Analysis — evidence-based treatment for anomia after stroke.</p>
      </div>`;
    document.getElementById("start").addEventListener("click", startSession);
    document.getElementById("replay-tut").addEventListener("click", () => go("tutorial"));
    renderRemindersCard();
  },

  session() {
    // Setup stage (Lace Pro pattern): guide introduces the session conversationally —
    // what to expect and why — before the first card.
    const s = session;
    const reviewCount = s.queue.filter(w => db.srs[w.id]).length;
    const newCount = s.queue.length - reviewCount;
    const intro = [
      `Hi ${db.profile.name}. Today we have ${s.queue.length} words.`,
      reviewCount && newCount ? `${reviewCount} you've seen before, and ${newCount} new one${newCount === 1 ? "" : "s"}.` :
        reviewCount ? "All of them are words you've practiced — let's make them stronger." :
        "They're all new — we'll take them slowly.",
      "We'll start easy and work up. For each one: look at the picture, tap the clues if you need them, and say the word out loud. Saying it is what rebuilds the connection.",
    ].join(" ");
    const showDemo = !db.profile.hideDemo;
    app.innerHTML = `
      <div style="padding-top:1.5rem">
        <div class="card" style="background:var(--blue-dim);border-color:var(--blue)">
          <span class="feature-label">Your guide</span>
          <p style="font-size:1.05rem">${esc(intro)}</p>
        </div>
        ${showDemo ? `
          <div class="card" style="display:flex;gap:1rem;align-items:center"><div style="font-size:2rem">👀</div><div><b>See the picture, tap the clues</b></div></div>
          <div class="card" style="display:flex;gap:1rem;align-items:center"><div style="font-size:2rem">🗣️</div><div><b>Say the word out loud</b></div></div>
          <div class="card" style="display:flex;gap:1rem;align-items:center"><div style="font-size:2rem">✅</div><div><b>Tap the green button</b></div></div>` : ""}
        <button class="btn btn-primary" id="demo-start">Let's begin</button>
        ${showDemo ? `<button class="btn btn-quiet" id="demo-hide">Don't show the steps again</button>` : ""}
      </div>`;
    guide(intro);
    document.getElementById("demo-start").addEventListener("click", renderCard);
    document.getElementById("demo-hide")?.addEventListener("click", () => {
      db.profile.hideDemo = true; db_.save(db); renderCard();
    });
  },

  // Guided practice round — one easy word, no scoring, no SRS writes.
  // Auto-runs once after onboarding; replayable from Home.
  tutorial() {
    nav.hidden = true;
    app.classList.add("no-nav");
    const w = WORDS.find(x => x.word === "apple"); // high-frequency, high-imageability
    const steps = [
      { coach: "Welcome! Let's try one practice word together. Nothing is scored — this is just to show you how it works.",
        setup: () => {}, waitFor: "next" },
      { coach: "Here's a picture. Try to say its word out loud. If it won't come, tap the blue Hint button — it gives one clue at a time.",
        setup: () => highlight("#cue"), waitFor: "hint" },
      { coach: "Nice. Each hint gives a bit more help. Now try saying the word out loud. When you've said it, tap the green button.",
        setup: () => highlight("#got"), waitFor: "got" },
      { coach: "That's it! You can tap Hint as many times as you need — the app gives more and more help until you get it. There's no way to fail.",
        setup: () => {}, waitFor: "next" },
      { coach: "You're ready. Practice a little every day — that's what makes words come back.",
        setup: () => {}, waitFor: "finish" },
    ];
    let step = 0;
    const stageCount = hintStages(w).length;
    app.innerHTML = `
      <div style="padding-top:1rem">
        <div class="card" style="background:var(--blue-dim);border-color:var(--blue)" id="coach">
          <span class="feature-label">Your guide</span>
          <p id="coach-text" style="font-size:1.05rem"></p>
        </div>
        <div class="card">
          <div class="word-image">${pictureHtml(w)}</div>
          <div id="hint-box"></div>
          <div class="hint-progress">${Array.from({ length: stageCount }, () => `<span></span>`).join("")}</div>
          <p class="btn-hint-count" id="hint-count"></p>
          <button class="btn btn-primary" id="got">I said it! ✓</button>
          <button class="btn btn-cue" id="cue">Hint</button>
        </div>
        <button class="btn btn-secondary" id="tut-next">Continue</button>
        <button class="btn btn-quiet" id="tut-skip">Skip the tutorial</button>
      </div>`;
    session = { card: { word: w, cueLevel: 0, hintsUsed: 0 } }; // tapHint() reads session.card; no SRS/session writes happen in the tutorial
    const nextBtn = document.getElementById("tut-next");
    function highlight(sel) {
      document.querySelectorAll(".tut-hl").forEach(el => { el.classList.remove("tut-hl"); el.style.outline = ""; });
      const el = document.querySelector(sel);
      if (el) { el.classList.add("tut-hl"); el.style.outline = "3px solid var(--accent)"; el.style.outlineOffset = "3px"; el.style.borderRadius = "14px"; }
    }
    function show() {
      const s = steps[step];
      document.getElementById("coach-text").textContent = s.coach;
      guide(s.coach);
      s.setup();
      nextBtn.textContent = s.waitFor === "finish" ? "Start practicing" : "Continue";
      nextBtn.style.display = (s.waitFor === "next" || s.waitFor === "finish") ? "" : "none";
    }
    function advance() {
      step++;
      if (step >= steps.length) return finishTutorial();
      show();
    }
    function finishTutorial() {
      db.profile.tutorialDone = true; db_.save(db); session = null; go("home");
    }
    nextBtn.addEventListener("click", () => steps[step].waitFor === "finish" ? finishTutorial() : advance());
    document.getElementById("tut-skip").addEventListener("click", finishTutorial);
    document.getElementById("cue").addEventListener("click", () => {
      tapHint();
      if (steps[step].waitFor === "hint") setTimeout(advance, 1600);
    });
    document.getElementById("got").addEventListener("click", () => {
      speak(w.word);
      if (steps[step].waitFor === "got") setTimeout(advance, 1200);
    });
    show();
  },

  summary() {
    const s = session;
    const fatigued = s.endState === eng.STATE.FATIGUE;
    app.innerHTML = `
      <div style="padding-top:2rem;text-align:center">
        <div style="font-size:3.5rem">${fatigued ? "🌿" : "🎉"}</div>
        <h1>${fatigued ? "Great stopping point" : "Session complete"}</h1>
        <div class="card" style="text-align:left">
          <p><b>${s.results.length} words practiced</b></p>
          <p class="muted">${s.results.filter(r => r.cueLevel <= 1).length} came to you easily — those are getting stronger.</p>
          ${fatigued ? `<div class="fatigue-note">The app noticed today's words were feeling heavier, so it wrapped up early. That's the practice protecting your energy — it's part of how recovery works, not a setback.</div>` : ""}
        </div>
        <button class="btn btn-primary" id="done">Done</button>
      </div>`;
    document.getElementById("done").addEventListener("click", () => go("home"));
  },

  progress() {
    const recovered = db_.wordsRecovered(db);
    const trend = db_.meanCueTrend(db);
    const cal = db_.adherenceCalendar(db);
    const firstCue = trend.length ? trend[0].meanCue : null;
    const lastCue = trend.length ? trend[trend.length - 1].meanCue : null;
    const improving = firstCue != null && lastCue != null && trend.length >= 3 && lastCue < firstCue;
    app.innerHTML = `
      <div style="padding-top:1.5rem">
        <h1>Your progress</h1>
        <div class="card">
          <h2 style="color:var(--green)">${recovered} words recovered</h2>
          <p class="muted" style="margin-top:0.4rem">${recovered > 0 ? `That's ${recovered} word${recovered === 1 ? "" : "s"} you can now find on your own that needed help before.` : "Words you master will show up here — every one is a real win."}</p>
        </div>
        <div class="card">
          <b>Needing less help over time</b>
          <p class="muted small">Lower means words are coming to you with fewer hints — a key sign of recovery.</p>
          ${sparkline(trend.map(t => t.meanCue), 4)}
          ${improving ? `<p class="small" style="color:var(--green);font-weight:600">↓ Trending down — your retrieval is getting stronger.</p>` : `<p class="muted small">Keep practicing — the trend appears after a few sessions.</p>`}
        </div>
        <div class="card">
          <b>Last 4 weeks</b>
          <div class="cal">${cal.map(d => `<div class="${d.fatigue ? "fat" : d.sessions ? "did" : ""}" title="${d.date}"></div>`).join("")}</div>
          <p class="muted small" style="margin-top:0.5rem">Green = practiced · Orange = practiced, ended early to rest</p>
        </div>
        <p class="evidence-note">Consistent practice between therapy sessions is one of the strongest predictors of aphasia recovery.</p>
      </div>`;
  },

  caregiver() {
    const inactive = db_.daysInactive(db);
    const recent = db_.recentSessions(db, 7);
    const fatigueCount = recent.filter(s => s.endState === "fatigue").length;
    const cal = db_.adherenceCalendar(db);
    const wk = weekStart();
    const done = db.checkins.find(c => c.weekStart === wk);
    app.innerHTML = `
      <div style="padding-top:1.5rem">
        <h1>Care partner view</h1>
        <p class="muted small">${esc(db.profile.caregiverName || "For the person supporting")} — a quiet window into how practice is going.</p>
        ${notificationsSupported() ? `<p class="muted small" style="margin-top:0.3rem">Reminders: ${notificationPermission() !== "granted" ? "not turned on" : db.profile.remindersPaused ? "paused" : "on (9am / 2pm)"} — only fire while the app is open on her device, not a true push. <a href="#" id="reminders-explainer" style="color:var(--blue)">Why?</a></p>` : ""}
        ${inactive != null && inactive >= 3 ? `<div class="card" style="border-color:var(--accent)"><b style="color:var(--accent)">It's been ${inactive} days since the last practice.</b><p class="muted small" style="margin-top:0.3rem">A gentle nudge or offering to sit together for a session often helps more than a reminder.</p></div>` : ""}
        <div class="stat-grid">
          <div class="stat"><b>${recent.length}</b><span>sessions this week</span></div>
          <div class="stat"><b>${fatigueCount}</b><span>early-rest endings</span></div>
        </div>
        ${fatigueCount >= 2 ? `<div class="fatigue-note">Practice has been ending early more often this week. The app has already lowered the daily target — no action needed, but a lighter week may be in order.</div>` : ""}
        <div class="card">
          <b>Practice calendar</b>
          <div class="cal">${cal.map(d => `<div class="${d.fatigue ? "fat" : d.sessions ? "did" : ""}"></div>`).join("")}</div>
        </div>
        <div class="card">
          <b>Weekly check-in</b>
          <p class="muted small">Five quick questions about real-world communication. This is the progress that matters most — and it's the part only you can see.</p>
          ${done ? `<p style="margin-top:0.75rem;color:var(--green);font-weight:600">✓ Done for this week (score ${done.total}/20)</p>` : `<button class="btn btn-secondary" id="checkin">Start check-in</button>`}
          ${checkinTrend()}
        </div>
        <div class="card">
          <b>Session log</b>
          <p class="muted small">Every session on this device, including ones ended early.</p>
          ${db.sessions.length ? `<div style="overflow-x:auto"><table style="width:100%;font-size:0.82rem;border-collapse:collapse;margin-top:0.5rem">
            <tr style="text-align:left;color:var(--text-2)"><th>Date</th><th>Words</th><th>No/low hint</th><th>Ended</th></tr>
            ${db.sessions.slice(-14).reverse().map(s => `<tr style="border-top:1px solid var(--border)">
              <td style="padding:0.3rem 0.4rem 0.3rem 0">${s.date}</td><td>${s.attempts}</td><td>${s.l0l1}</td>
              <td>${s.endState === "flow" ? "completed" : s.endState === "fatigue" ? "early rest" : s.endState}</td></tr>`).join("")}
          </table></div>` : `<p class="muted small" style="margin-top:0.5rem">No sessions recorded on this device yet. Note: practice data lives on the device it was done on — sessions done on another phone or browser won't appear here.</p>`}
        </div>
        <div class="card" id="tts-diag-card">
          <b>Voice diagnostics</b>
          <p class="muted small">If the voice sounds robotic on this device, this shows why.</p>
        </div>
        <div class="card">
          <button class="btn btn-quiet" id="export-data">Copy data export</button>
        </div>
      </div>`;
    renderTtsDiagnostics();
    document.getElementById("reminders-explainer")?.addEventListener("click", e => {
      e.preventDefault();
      alert("This app doesn't have a server yet, so reminders can't wake a locked phone the way texts or calls do — they only show up while Reclaim is open or in a background browser tab. True push notifications need real server infrastructure, which isn't built yet.");
    });
    document.getElementById("checkin")?.addEventListener("click", renderCheckin);
    document.getElementById("export-data").addEventListener("click", async e => {
      const payload = JSON.stringify({ exportedAt: new Date().toISOString(), tts: getTtsDiagnostics(), ...db }, null, 2);
      try { await navigator.clipboard.writeText(payload); e.target.textContent = "✓ Copied"; }
      catch { prompt("Copy this:", payload); }
    });
  },
};

// ── session flow ──────────────────────────────────────────────────
function startSession() {
  const maxItems = Math.max(4, Math.round(db.profile.sessionTargetMin * 0.9));
  const { queue, masteredPool } = eng.buildQueue(WORDS, db.srs, maxItems);
  if (!queue.length) { queue.push(...WORDS.slice(0, 5)); }
  session = {
    id: uid(), date: eng.today(), startedAt: Date.now(),
    queue, masteredPool, idx: 0, results: [],
    monitor: eng.createIntensityMonitor(), norm7dCue: db_.norm7dCue(db),
    card: null, endState: eng.STATE.FLOW,
  };
  go("session");
}

function renderCard() {
  const s = session;
  const word = s.queue[s.idx];
  s.card = { word, cueLevel: 0, hintsUsed: 0, shownAt: Date.now(), firstTapAt: null };
  const w = word;
  const stageCount = hintStages(w).length;
  app.innerHTML = `
    <div style="padding-top:0.6rem">
      <div class="progress-dots" style="margin-bottom:0.5rem">${s.queue.map((_, i) => `<span class="dot ${i < s.idx ? "done" : i === s.idx ? "now" : ""}"></span>`).join("")}</div>
      <p class="muted small" style="text-align:center;margin-bottom:0.4rem">Think about this one — try to say the word out loud, or tap Hint if you need a clue.</p>
      <div class="card">
        <div class="word-image">${pictureHtml(w)}</div>
        <div id="hint-box"></div>
        <div class="hint-progress">${Array.from({ length: stageCount }, () => `<span></span>`).join("")}</div>
        <p class="btn-hint-count" id="hint-count"></p>
        <button class="btn btn-primary" id="got">I said it! ✓</button>
        <button class="btn btn-cue" id="cue">Hint</button>
        <button class="btn btn-quiet" id="rest">I'd like to stop here</button>
      </div>
      <p class="evidence-note" style="margin-top:0.6rem;padding-top:0.5rem">Semantic Feature Analysis — evidence-based treatment for anomia after stroke.</p>
    </div>`;
  document.getElementById("got").addEventListener("click", () => { markFirstTap(); renderReinforcement(); });
  document.getElementById("cue").addEventListener("click", () => { markFirstTap(); tapHint(); });
  document.getElementById("rest").addEventListener("click", () => endSession(eng.STATE.FLOW, true));

  // spoken stage guidance: full instruction on the first card, brief after
  if (s.idx === 0) guide("Look at the picture. Tap the clues, take your time, and try to say the word out loud.", 400);
  else guide("Here's the next one.", 400);
}

// ── Reinforcement loop (Lace Pro pattern) ─────────────────────────
// After "I said it": the guide repeats the correct word back, has the patient
// say it again aloud, then verifies before logging the outcome. A "no" at
// verification routes to one more errorless repetition rather than silently
// logging a false success — this is also what makes the outcome data trustworthy.
function renderReinforcement(attempt = 1) {
  const s = session; const c = s.card; const w = c.word;
  app.innerHTML = `
    <div style="padding-top:1.5rem;text-align:center">
      <div class="word-image">${pictureHtml(w)}</div>
      <p class="muted">The word is</p>
      <div class="word-reveal">${esc(w.word)}</div>
      <p class="muted small">Say it once more, together with the voice.</p>
      <button class="btn btn-primary" id="repeated">I said it again ✓</button>
    </div>`;
  speak(w.word, { interrupt: false });
  guide("Now say it with me: " + w.word, 900);
  document.getElementById("repeated").addEventListener("click", () => renderVerification(attempt));
}

function renderVerification(attempt) {
  const w = session.card.word;
  app.innerHTML = `
    <div style="padding-top:1.5rem;text-align:center">
      <div class="word-image">${pictureHtml(w)}</div>
      <p class="cue-text">Was that the word you had in mind?</p>
      <button class="btn btn-primary" id="v-yes">Yes, that's it</button>
      <button class="btn btn-secondary" id="v-no">Not quite</button>
    </div>`;
  guide("Was that the word you had in mind?", 300);
  document.getElementById("v-yes").addEventListener("click", () => finishCard(true));
  document.getElementById("v-no").addEventListener("click", () => {
    // errorless recovery: one more full-support pass, capped so it can't loop forever
    if (attempt >= 2) { session.card.cueLevel = eng.CUE.REPEAT; return finishCard(true); }
    session.card.cueLevel = Math.min(session.card.cueLevel + 1, eng.CUE.REPEAT);
    guide("That's alright — let's hear it once more.", 200);
    renderReinforcement(attempt + 1);
  });
}

function markFirstTap() { if (!session.card.firstTapAt) session.card.firstTapAt = Date.now(); }

// ── Unified progressive hint ladder ────────────────────────────────
// One "Hint" button, tapped repeatedly. Semantic support first (category →
// use/property → location/association → sentence frame), then phonemic
// (first sound → written word → full audio + repeat). Every stage is mapped
// onto the existing 5-level engine.CUE scale so the SRS scheduler and the
// fatigue-detection engine (engine.js) — both already tuned and verified
// against that scale — need no changes; hintsUsed (the raw tap count) is
// tracked separately as the number the user asked to see logged.
function hintStages(w) {
  return [
    { label: "Category", text: "It's " + w.category, cueLevel: eng.CUE.NONE },
    { label: "What it's for", text: "It's used for " + w.use + ". It's " + w.property + ".", cueLevel: eng.CUE.FRAME },
    { label: "Where you'd find it", text: "You find it " + w.location + ". It makes you think of " + w.association + ".", cueLevel: eng.CUE.FRAME },
    { label: "A sentence to help", text: '"' + w.frame.replace("___", "____") + '"', speakText: w.frame.replace("___", "hmm"), cueLevel: eng.CUE.FRAME, rate: 0.8 },
    { label: "First sound", text: `It starts with "${w.phoneme}"…`, speakText: "It starts with " + w.phoneme, cueLevel: eng.CUE.PHONEME },
    { label: "Here's the word", text: w.word.toUpperCase() + " — read it out loud, that counts!", speakText: "Here's the word. Read it out loud — that counts.", cueLevel: eng.CUE.WRITTEN },
    { label: "Listen and repeat", text: w.word.toUpperCase() + " — listen, then say it together with the voice.", speakText: null, cueLevel: eng.CUE.REPEAT, isFinal: true },
  ];
}

function tapHint() {
  const c = session.card; const w = c.word;
  const stages = hintStages(w);
  c.hintsUsed = (c.hintsUsed ?? 0) + 1;
  const stage = stages[Math.min(c.hintsUsed - 1, stages.length - 1)];
  c.cueLevel = stage.cueLevel;

  const box = document.getElementById("hint-box");
  box.innerHTML = `<span class="feature-label">${stage.label}</span><p>${esc(stage.text)}</p>`;
  document.querySelectorAll(".hint-progress span").forEach((dot, i) => dot.classList.toggle("used", i < c.hintsUsed));
  document.getElementById("hint-count").textContent = `${c.hintsUsed} hint${c.hintsUsed === 1 ? "" : "s"} used`;

  if (stage.speakText !== null) speak(stage.speakText ?? stage.text, { rate: stage.rate ?? 0.85, interrupt: false });
  if (stage.isFinal) {
    speak(w.word, { interrupt: false }); setTimeout(() => speak(w.word, { interrupt: false }), 1500);
    document.getElementById("cue").style.display = "none";
  }
}

// Upsert the running session row so nothing is lost if the app closes mid-session.
function syncSession(endState) {
  const s = session;
  const meanCue = s.results.length ? s.results.reduce((a, r) => a + r.cueLevel, 0) / s.results.length : null;
  const meanLat = s.results.length ? Math.round(s.results.reduce((a, r) => a + r.latencyMs, 0) / s.results.length) : null;
  const row = {
    id: s.id, date: s.date, startedAt: s.startedAt, endedAt: Date.now(),
    plannedMin: db.profile.sessionTargetMin, endState,
    attempts: s.results.length, l0l1: s.results.filter(r => r.cueLevel <= 1).length,
    meanLatency: meanLat, meanCue: meanCue == null ? null : +meanCue.toFixed(2),
  };
  const i = db.sessions.findIndex(x => x.id === s.id);
  if (i >= 0) db.sessions[i] = row; else db.sessions.push(row);
  db_.save(db);
}

function finishCard(success) {
  const s = session; const c = s.card;
  const latencyMs = (c.firstTapAt ?? Date.now()) - c.shownAt;
  speak(c.word.word); // reinforce with the spoken word on every success
  s.results.push({ wordId: c.word.id, cueLevel: c.cueLevel, hintsUsed: c.hintsUsed ?? 0, latencyMs });
  db.srs[c.word.id] = eng.recordOutcome(db.srs[c.word.id] ?? eng.newSrsState(c.word.id), c.cueLevel);
  syncSession("abandoned"); // provisional state; finalized in endSession

  const prevState = s.monitor.state;
  s.monitor = eng.observeAttempt(s.monitor, { latencyMs, cueLevel: c.cueLevel }, s.norm7dCue);

  if (s.monitor.state === eng.STATE.FATIGUE) {
    // serve one guaranteed-success closer, then summary
    const closer = s.masteredPool[0] ?? s.queue.find((w, i) => i > s.idx && w.difficulty === 1);
    if (closer && s.results.length && s.results[s.results.length - 1].cueLevel > 1) {
      s.queue = [...s.queue.slice(0, s.idx + 1), closer];
    } else { return endSession(eng.STATE.FATIGUE); }
    s.endState = eng.STATE.FATIGUE;
  } else if (s.monitor.state === eng.STATE.STRAIN && prevState === eng.STATE.FLOW) {
    const remaining = s.queue.slice(s.idx + 1);
    s.queue = [...s.queue.slice(0, s.idx + 1), ...eng.applyStrain(remaining, s.masteredPool)];
  }

  s.idx++;
  if (s.idx >= s.queue.length) return endSession(s.endState);
  renderCard();
}

function endSession(endState, voluntary = false) {
  const s = session;
  if (!s.results.length) { session = null; return go("home"); }
  s.endState = voluntary ? eng.STATE.FLOW : endState;
  syncSession(s.endState);
  db = db_.bumpStreak(db, s.date);
  db.profile.sessionTargetMin = eng.planNextTarget(
    { sessionTargetMin: db.profile.sessionTargetMin },
    db.sessions.filter(x => daysBetween(x.date, eng.today()) < 7));
  db_.save(db);
  go("summary");
}

// ── caregiver check-in ────────────────────────────────────────────
const CHECKIN_QS = [
  "Made needs known without frustration",
  "Joined family conversation",
  "Used names of people/objects on their own",
  "Handled a phone call or greeting",
  "Word-finding frustration was low",
];
function renderCheckin() {
  const scores = Array(5).fill(2);
  app.innerHTML = `
    <div style="padding-top:1.5rem">
      <h1>Weekly check-in</h1>
      <p class="muted small">Thinking about this past week: 0 = not at all, 4 = consistently.</p>
      ${CHECKIN_QS.map((q, i) => `
        <div class="card"><b>${q}</b>
          <div class="scale-row" data-q="${i}">${[0, 1, 2, 3, 4].map(v => `<button data-v="${v}" class="${v === 2 ? "sel" : ""}">${v}</button>`).join("")}</div>
        </div>`).join("")}
      <button class="btn btn-primary" id="save-ci">Save check-in</button>
    </div>`;
  app.querySelectorAll(".scale-row").forEach(row => row.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    scores[+row.dataset.q] = +b.dataset.v;
    row.querySelectorAll("button").forEach(x => x.classList.toggle("sel", x === b));
  }));
  document.getElementById("save-ci").addEventListener("click", () => {
    db.checkins.push({ weekStart: weekStart(), scores, total: scores.reduce((a, b) => a + b, 0) });
    db_.save(db); go("caregiver");
  });
}

function checkinTrend() {
  if (db.checkins.length < 2) return "";
  return sparkline(db.checkins.map(c => c.total), 20, true);
}

// ── tiny sparkline (SVG, no deps) ─────────────────────────────────
function sparkline(values, max, higherIsBetter = false) {
  if (!values.length) return `<div class="spark"></div>`;
  const w = 300, h = 64, pad = 6;
  const pts = values.map((v, i) => {
    const x = pad + (values.length === 1 ? w / 2 : i * (w - 2 * pad) / (values.length - 1));
    const y = pad + (1 - v / max) * (h - 2 * pad);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="${path}" fill="none" stroke="var(--${higherIsBetter ? "green" : "blue"})" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="var(--accent)"/></svg>`;
}

function renderTtsDiagnostics() {
  const card = document.getElementById("tts-diag-card");
  if (!card) return;
  const diag = getTtsDiagnostics();
  const recent = diag.failures.slice(-5).reverse();
  const stageLabel = f => f === "fetch" ? "Network/CORS blocked the request"
    : f === "play" ? "Browser blocked audio playback (autoplay policy)"
    : f.startsWith("http-401") ? "Voice key rejected (invalid or missing permission)"
    : f.startsWith("http-") ? `Voice service error (${f.replace("http-", "")})`
    : f;
  card.innerHTML = `
    <b>Voice diagnostics</b>
    <p class="muted small">If the voice sounds robotic on this device, this shows why.</p>
    <p style="margin-top:0.6rem"><b>Natural voice:</b> ${diag.usingElevenLabs ? "configured ✓" : "no key set — always uses the robotic browser voice"}</p>
    ${recent.length ? `
      <p class="small" style="margin-top:0.6rem;color:var(--accent);font-weight:600">Recent fallbacks on this device:</p>
      ${recent.map(f => `<p class="muted small">${new Date(f.t).toLocaleString()} — ${stageLabel(f.stage)}${f.stage.startsWith("http-") ? ` (${f.message.slice(0,80)})` : ""}</p>`).join("")}
    ` : diag.usingElevenLabs ? `<p class="muted small" style="margin-top:0.6rem;color:var(--green)">No fallback events recorded — natural voice should be playing.</p>` : ""}
    <button class="btn btn-secondary" id="tts-test">Test the voice now</button>
    <p class="muted small" id="tts-test-result"></p>`;
  document.getElementById("tts-test").addEventListener("click", () => {
    document.getElementById("tts-test-result").textContent = "Playing…";
    speak("This is a test of the practice voice.");
    setTimeout(() => renderTtsDiagnostics(), 1500); // re-render to pick up any new failure entry
  });
}

function renderRemindersCard() {
  const card = document.getElementById("reminders-card");
  if (!card) return;
  const perm = notificationPermission();
  const paused = !!db.profile.remindersPaused;

  if (perm === "default") {
    card.innerHTML = `<b>Daily reminders</b>
      <p class="muted small" style="margin-top:0.3rem">Get a gentle nudge at 9am, and again at 2pm if you haven't practiced yet. Only works while this app is open in your browser — see the note in Care Partner for what that means.</p>
      <button class="btn btn-secondary" id="enable-reminders">Turn on reminders</button>`;
    document.getElementById("enable-reminders").addEventListener("click", async () => {
      await requestNotificationPermission();
      db.profile.remindersPaused = false; db_.save(db);
      renderRemindersCard();
    });
  } else if (perm === "denied") {
    card.innerHTML = `<b>Daily reminders</b>
      <p class="muted small" style="margin-top:0.3rem">Reminders need permission from your browser. You can turn them on from your browser's site settings if you change your mind.</p>`;
  } else { // granted
    card.innerHTML = `<b>Daily reminders</b>
      <p class="muted small" style="margin-top:0.3rem;color:${paused ? "var(--text-2)" : "var(--green)"}">${paused ? "Paused — you won't get 9am/2pm nudges right now." : "✓ On — a nudge at 9am and 2pm on days you haven't practiced yet."}</p>
      <button class="btn btn-quiet" id="toggle-reminders">${paused ? "Turn back on" : "Pause reminders"}</button>`;
    document.getElementById("toggle-reminders").addEventListener("click", () => {
      db.profile.remindersPaused = !paused; db_.save(db);
      renderRemindersCard();
    });
  }
}

function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - d.getDay());
  return eng.localDate(d);
}
function daysBetween(a, b) { return Math.abs(new Date(b) - new Date(a)) / 86400000; }

// warm up voices (Chrome loads them async)
window.speechSynthesis?.getVoices?.();

// Reminders only fire while this tab is open (see notifications.js for why).
// Check on load, whenever the tab regains focus, and every few minutes while open.
function runReminderCheck() {
  if (!db.profile.onboarded) return;
  const hasSessionToday = db.sessions.some(s => s.date === eng.today());
  if (checkReminders(db, hasSessionToday)) db_.save(db);
}
runReminderCheck();
document.addEventListener("visibilitychange", () => { if (!document.hidden) runReminderCheck(); });
setInterval(runReminderCheck, 5 * 60 * 1000);

go(db.profile.onboarded ? "home" : "onboarding");
