const PROXYABLE_PATHS = new Set([
  "/calendar.ics",
  "/knockout.json",
  "/schedule.json"
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!shouldProxy(url.pathname)) {
    return context.next();
  }

  return proxyWorkerAsset(context, url);
}

async function proxyWorkerAsset({ env, request }, requestUrl) {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders() });
  }

  const workerBaseUrl = normalizeBaseUrl(env.PUBLIC_WORKER_BASE_URL);
  if (!workerBaseUrl) {
    return new Response("PUBLIC_WORKER_BASE_URL is not configured", { status: 500, headers: corsHeaders() });
  }

  const target = new URL(requestUrl.pathname.replace(/^\/+/, ""), `${workerBaseUrl}/`);
  target.search = requestUrl.search;

  const response = await fetch(target, { method: request.method });
  return withCors(response);
}

function shouldProxy(pathname) {
  return PROXYABLE_PATHS.has(pathname) || /^\/matches\/match-\d+\.ics$/.test(pathname);
}

function normalizeBaseUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.trim().replace(/\/+$/, "");
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders())) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
