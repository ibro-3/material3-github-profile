import { handleCors, forward, corsHeaders } from "./_github.js";

export default async function handler(req, env) {
  // OPTIONS preflight handled by handleCors
  const corsResp = handleCors(req);
  if (corsResp) return corsResp;

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders(req) });
  }

  // Forward to GitHub
  return forward(req, env, "https://github.com/login/device/code", { scope: "public_repo workflow" });
}