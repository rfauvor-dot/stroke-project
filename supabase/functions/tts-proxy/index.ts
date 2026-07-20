// Reclaim — TTS proxy Edge Function.
//
// Purpose: hold the ElevenLabs API key server-side so it never ships to a
// browser. The client (app/tts.js) posts { text, voiceId, model_id,
// voice_settings } here instead of calling ElevenLabs directly; this
// function attaches the real key (from a Supabase secret, never committed)
// and forwards the request, streaming the audio back unchanged.
//
// Deploy:
//   supabase functions deploy tts-proxy
//   supabase secrets set ELEVENLABS_KEY=sk_...   (from the ElevenCreative
//     workspace — see app/tts.js's header comment for the same caveat about
//     ElevenAPI vs ElevenCreative and the Text-to-Speech permission)
//
// Then set TTS_PROXY_URL in app/config.local.js to this function's URL
// (shown after `supabase functions deploy`, looks like
// https://<project-ref>.supabase.co/functions/v1/tts-proxy) and tts.js
// switches to it automatically.

const ELEVENLABS_KEY = Deno.env.get("ELEVENLABS_KEY") ?? "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }
  if (!ELEVENLABS_KEY) {
    return new Response("Server misconfigured: ELEVENLABS_KEY secret not set", {
      status: 500, headers: CORS_HEADERS,
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400, headers: CORS_HEADERS });
  }
  const { text, voiceId, model_id, voice_settings } = body ?? {};
  if (!text || !voiceId) {
    return new Response("Missing required fields: text, voiceId", { status: 400, headers: CORS_HEADERS });
  }
  // Guard against abuse driving up ElevenLabs cost through an open proxy —
  // the app's own word/cue library never needs a prompt anywhere near this long.
  if (String(text).length > 500) {
    return new Response("Text too long", { status: 400, headers: CORS_HEADERS });
  }

  const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: model_id ?? "eleven_turbo_v2_5",
      voice_settings: voice_settings ?? { stability: 0.55, similarity_boost: 0.75 },
    }),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return new Response(detail || "ElevenLabs request failed", {
      status: upstream.status, headers: CORS_HEADERS,
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "audio/mpeg" },
  });
});
