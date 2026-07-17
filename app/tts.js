// Reclaim — TTS provider adapter.
//
// Live provider: ElevenLabs if a key is configured (see config.local.js), else
// falls back to the browser's Web Speech API so the app never breaks silently.
//
// Setup for natural voice (ElevenLabs):
//   1. Copy config.local.example.js -> config.local.js (already gitignored).
//   2. Put a key from the ElevenCreative workspace in it — NOT ElevenAPI, which
//      has had a $0 balance historically. The key must have "Text to Speech"
//      permission checked at creation, or every call 401s with
//      "missing permission text_to_speech".
//   3. Default voice is Sarah (EXAVITQu4vr4xnSDxMaL) — same reference voice used
//      for Pearl. Override via ELEVEN_VOICE_ID in config.local.js if desired.
//
// This is a static site with no server yet, so the key necessarily ships to the
// client that loads config.local.js — acceptable for a private beta-test build,
// but config.local.js MUST stay out of version control (see .gitignore) and
// must be replaced by a real backend/env-var proxy before any public release.

import { ELEVEN_API_KEY, ELEVEN_VOICE_ID } from "./config.local.js";

const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // ElevenLabs "Sarah"
const voiceId = ELEVEN_VOICE_ID || DEFAULT_VOICE_ID;
const haveKey = !!ELEVEN_API_KEY && ELEVEN_API_KEY !== "REPLACE_ME";

let audioEl = null;
const cache = new Map(); // text -> object URL, since the word/cue library is finite and repeats a lot

// Failures on a phone are invisible — no dev console to check. Keep a small
// rolling log so the Care Partner screen / data export can surface *why*
// playback fell back to the robotic voice (CORS, autoplay block, 401, etc.)
// instead of forcing us to guess blind from this end.
const failureLog = [];
function logFailure(stage, err) {
  failureLog.push({
    t: new Date().toISOString(), stage,
    name: err?.name, message: String(err?.message ?? err).slice(0, 300),
  });
  if (failureLog.length > 20) failureLog.shift();
}
export function getTtsDiagnostics() {
  return { usingElevenLabs: haveKey, voiceId, failures: [...failureLog] };
}

function pickWebSpeechVoice() {
  const vs = window.speechSynthesis?.getVoices?.() ?? [];
  return vs.find(v => v.lang.startsWith("en") && /female|Zira|Samantha|Jenny/i.test(v.name))
      || vs.find(v => v.lang.startsWith("en")) || null;
}

function speakWebSpeech(text, rate) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  const v = pickWebSpeechVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

async function speakElevenLabs(text, rate, interrupt) {
  if (interrupt) stop();
  let url = cache.get(text);
  if (!url) {
    let res;
    try {
      res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: { "xi-api-key": ELEVEN_API_KEY, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.55, similarity_boost: 0.75, speed: rate },
        }),
      });
    } catch (netErr) {
      // fetch() throwing (not a non-2xx response) is the CORS / offline / DNS signature
      logFailure("fetch", netErr);
      throw netErr;
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const httpErr = new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 200)}`);
      logFailure("http-" + res.status, httpErr);
      throw httpErr;
    }
    const blob = await res.blob();
    url = URL.createObjectURL(blob);
    cache.set(text, url);
  }
  audioEl = new Audio(url);
  try {
    await audioEl.play();
  } catch (playErr) {
    // NotAllowedError here = browser autoplay policy blocked playback
    // (typically means this call happened without a direct user gesture)
    logFailure("play", playErr);
    throw playErr;
  }
}

// interrupt: true cuts off current speech; false queues after it (for chained prompts)
export function speak(text, { rate = 0.85, interrupt = true } = {}) {
  if (!text) return;
  if (haveKey) {
    speakElevenLabs(text, rate, interrupt).catch(err => {
      console.error("[tts] ElevenLabs failed, falling back to browser voice:", err.message);
      speakWebSpeech(text, rate);
    });
  } else {
    speakWebSpeech(text, rate);
  }
}

export function stop() {
  window.speechSynthesis?.cancel();
  audioEl?.pause();
}

export const usingElevenLabs = haveKey;
