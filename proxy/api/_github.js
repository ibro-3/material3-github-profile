const ORIGINS = ["https://ibro-3.github.io", "http://localhost:5230"];

function getAllowedOrigin(req) {
  const origin = req.headers.get("origin");
  if (ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
}

export function corsHeaders(req) {
  const origin = getAllowedOrigin(req);
  const h = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  if (origin) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  }
  return h;
}

export function handleCors(req) {
  // OPTIONS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  const allowed = getAllowedOrigin(req);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null; // OK to proceed
}

export async function forward(req, env, url, body) {
  const clientId = env.CLIENT_ID || "Ov23liAEXZsLn6roa8id";
  const h = corsHeaders(req);

  let r;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, ...body }),
    });
  } catch {
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 502,
      headers: h,
    });
  }

  const text = await r.text().catch(() => "");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: "unavailable" };
  }

  h.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status: r.status, headers: h });
}