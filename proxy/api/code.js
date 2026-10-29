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

  // Forward to GitHub
  return forward(env, "https://github.com/login/device/code", { scope: "public_repo workflow" });
}