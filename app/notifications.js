// Reclaim — daily reminder notifications.
//
// HONEST SCOPE: this is a static site with no backend/push server. A genuine
// push notification that wakes a locked phone at 9am even with the app fully
// closed requires: (1) a real server sending scheduled pushes (VAPID keys +
// a cron job), and (2) on iPhone specifically, the app installed to the home
// screen as a PWA (Safari only supports web push for installed PWAs, iOS
// 16.4+). Neither exists yet — building them is a real infrastructure
// project, not an app-code change, and needs a hosting decision first.
//
// What this DOES do, reliably, today: personalized reminders that fire
// whenever the app is open or in a background tab — on load, on tab
// refocus, and via a periodic check while the tab stays open. It checks
// once per calendar day per threshold (9am / 2pm) so it won't repeat.
import { speak } from "./tts.js";

const MORNING_HOUR = 9;
const AFTERNOON_HOUR = 14;

export function notificationsSupported() {
  return "Notification" in window;
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return "unsupported";
  return Notification.requestPermission();
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fire(title, body) {
  if (notificationsSupported() && Notification.permission === "granted") {
    try { new Notification(title, { body, icon: undefined, tag: "reclaim-reminder" }); } catch {}
  }
  speak(body, { rate: 0.9 });
}

// Call on app load, on tab focus, and periodically (e.g. every few minutes)
// while the tab is open. db must have profile.name and reminderLog (persisted
// so a reminder never fires twice in one day even across reloads).
export function checkReminders(db, hasSessionToday) {
  const now = new Date();
  const hour = now.getHours();
  const today = todayStr();
  db.profile.reminderLog ??= {};
  const log = db.profile.reminderLog;
  const name = db.profile.name || "there";
  let fired = false;

  if (!hasSessionToday && hour >= MORNING_HOUR && log[today] !== "morning" && log[today] !== "afternoon") {
    fire("Time to practice, Reclaim", `Hi ${name}, time for your word practice today.`);
    log[today] = "morning";
    fired = true;
  } else if (!hasSessionToday && hour >= AFTERNOON_HOUR && log[today] !== "afternoon") {
    fire("A gentle reminder — Reclaim", `Hi ${name}, just a gentle reminder — a few minutes of word practice today would be great.`);
    log[today] = "afternoon";
    fired = true;
  }
  return fired;
}
