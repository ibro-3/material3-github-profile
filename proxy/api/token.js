import { handleCors, forward, corsHeaders } from "./_github.js";

export default async function handler(req, env) {
  // OPTIONS preflight handled by handleCors
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders(req) });
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: corsHeaders(req),
    });
  }

  const code = body?.device_code;
  if (typeof code !== "string" || code.length > 100) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: corsHeaders(req),
    });
  }

  // Forward to GitHub
  return forward(req, env, "https://github.com/login/oauth/access_token", {
    device_code: code,
    grant_type: "urn:ietf:params:oauth:grant-type:device_code",
  });
}