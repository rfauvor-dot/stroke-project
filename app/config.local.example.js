// Copy this file to config.local.js and fill in real values.
// config.local.js is gitignored — never commit an API key.
//
// Key source: ElevenCreative workspace (NOT ElevenAPI — historically $0 balance).
// The key must have "Text to Speech" permission checked at creation time,
// or requests fail with 401 "missing permission text_to_speech".

export const ELEVEN_API_KEY = "REPLACE_ME";

// Optional: override the default voice (ElevenLabs "Sarah", same reference used for Pearl).
export const ELEVEN_VOICE_ID = "";

// Once the TTS proxy Edge Function is deployed (see SUPABASE_SETUP.md), put
// its URL here and tts.js will call it instead of ElevenLabs directly — the
// API key then lives server-side only, never shipped to the browser. Leave
// blank to keep using the direct-key path above (current behavior).
export const TTS_PROXY_URL = "";

// ── Supabase (optional — app works exactly as before without these) ──
// Create a project at supabase.com, run supabase/schema.sql in its SQL
// editor, then copy the Project URL and anon/public key from
// Project Settings > API. Full steps in SUPABASE_SETUP.md.
export const SUPABASE_URL = "REPLACE_ME";
export const SUPABASE_ANON_KEY = "REPLACE_ME";
