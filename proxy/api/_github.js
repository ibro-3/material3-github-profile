const ORIGINS = ["https://ibro-3.github.io", "http://localhost:5230"];

export function cors(req, env) {
  const origin = req.headers.get("origin");
  if (ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
}

export function handleCors(req, env) {
  const origin = cors(req, env);
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

export async function forward(env, url, body) {
  const clientId = env.CLIENT_ID || "Ov23liAEXZsLn6roa8id";
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
      headers: { "Content-Type": "application/json" },
    });
  }
  const text = await r.text().catch(() => "");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: "unavailable" };
  }
  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}