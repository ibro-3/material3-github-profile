import { handleCors, forward } from "./_github.js";

export default async function handler(req, env) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: handleCors(req, env) });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: handleCors(req, env) });
  }

  // Handle CORS
  const corsHeaders = handleCors(req, env);
  if (!corsHeaders) {
    return new Response("Forbidden", { status: 403, headers: { "Content-Type": "application/json" } });
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const code = body?.device_code;
  if (typeof code !== "string" || code.length > 100) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Forward to GitHub
  return forward(env, "https://github.com/login/oauth/access_token", {
    device_code: code,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
}