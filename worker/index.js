// Cloudflare Worker：每 10 分钟拉 FIFA 数据 → 写入 R2，并通过 HTTP 对外提供 schedule.json / calendar.ics / 单场 ICS。
// 共享逻辑见 shared/build-schedule.mjs。

import {
  fetchFifaMatches,
  buildSchedulePayload,
  buildKnockoutPayload,
  buildCalendar,
  buildMatchCalendar,
  DEFAULT_CANONICAL_HOST,
  normalizeCanonicalHost
} from "../shared/build-schedule.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

const SCHEDULE_KEY = "schedule.json";
const KNOCKOUT_KEY = "knockout.json";
const CALENDAR_KEY = "calendar.ics";
const CACHE_TTL_SECONDS = 600;

function canonicalHost(env) {
  return normalizeCanonicalHost(env.PUBLIC_CANONICAL_HOST || DEFAULT_CANONICAL_HOST);
}

function cacheKey(env) {
  return `https://${canonicalHost(env)}/__worker-cache/schedule.json`;
}

function jsonHeaders(cacheControl = `public, max-age=${CACHE_TTL_SECONDS}`) {
  return {
    ...CORS,
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cacheControl
  };
}

function calendarHeaders(cacheControl = `public, max-age=${CACHE_TTL_SECONDS}`) {
  return {
    ...CORS,
    "Content-Type": "text/calendar; charset=utf-8",
    "Cache-Control": cacheControl
  };
}

async function buildFreshSchedule(env) {
  const matches = await fetchFifaMatches();
  const generatedAt = new Date().toISOString();
  const { scheduleJson } = buildSchedulePayload({
    matches,
    generatedAt,
    canonicalHost: canonicalHost(env)
  });
  return { schedule: JSON.parse(scheduleJson), scheduleJson };
}

async function readCachedSchedule(env) {
  const cached = await caches.default.match(cacheKey(env));
  if (!cached) return null;
  const scheduleJson = await cached.text();
  return { schedule: JSON.parse(scheduleJson), scheduleJson };
}

async function writeCachedSchedule(env, scheduleJson, ctx) {
  const response = new Response(scheduleJson, { headers: jsonHeaders() });
  const write = caches.default.put(cacheKey(env), response);
  if (ctx) {
    ctx.waitUntil(write);
    return;
  }
  await write;
}

async function getSchedule(env, ctx, { forceRefresh = false } = {}) {
  if (!forceRefresh) {
    const cached = await readCachedSchedule(env);
    if (cached) return cached;
  }

  const fresh = await buildFreshSchedule(env);
  await writeCachedSchedule(env, fresh.scheduleJson, forceRefresh ? undefined : ctx);
  return fresh;
}

async function updateR2(env) {
  const matches = await fetchFifaMatches();
  const generatedAt = new Date().toISOString();
  const { scheduleJson, knockoutJson, calendarIcs } = buildSchedulePayload({
    matches,
    generatedAt,
    canonicalHost: canonicalHost(env)
  });

  const options = { httpMetadata: { cacheControl: `public, max-age=${CACHE_TTL_SECONDS}` } };

  await Promise.all([
    env.FIFA_BUCKET.put(SCHEDULE_KEY, scheduleJson, {
      ...options,
      httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: `public, max-age=${CACHE_TTL_SECONDS}` }
    }),
    env.FIFA_BUCKET.put(KNOCKOUT_KEY, knockoutJson, {
      ...options,
      httpMetadata: { contentType: "application/json; charset=utf-8", cacheControl: `public, max-age=${CACHE_TTL_SECONDS}` }
    }),
    env.FIFA_BUCKET.put(CALENDAR_KEY, calendarIcs, {
      ...options,
      httpMetadata: { contentType: "text/calendar; charset=utf-8", cacheControl: `public, max-age=${CACHE_TTL_SECONDS}` }
    })
  ]);

  return { matches: matches.length, generatedAt };
}

async function refreshSchedule(env, ctx) {
  const fresh = await getSchedule(env, ctx, { forceRefresh: true });
  if (env.FIFA_BUCKET) {
    await updateR2(env);
  }
  return { matches: fresh.schedule.matches.length, generatedAt: fresh.schedule.generatedAt };
}

async function serveSchedule(env, ctx) {
  const { scheduleJson } = await getSchedule(env, ctx);
  return new Response(scheduleJson, { headers: jsonHeaders() });
}

async function serveKnockout(env, ctx) {
  const { schedule } = await getSchedule(env, ctx);
  const content = JSON.stringify(
    buildKnockoutPayload(schedule.matches, schedule.generatedAt, { canonicalHost: canonicalHost(env) }),
    null,
    2
  ) + "\n";
  return new Response(content, { headers: jsonHeaders() });
}

async function serveCalendar(env, ctx) {
  const { schedule } = await getSchedule(env, ctx);
  const content = buildCalendar(schedule.matches, {
    generatedAt: schedule.generatedAt,
    canonicalHost: canonicalHost(env)
  });
  return new Response(content, { headers: calendarHeaders() });
}

async function serveMatchIcs(env, ctx, pathSegment) {
  // pathSegment 形如 "match-001.ics"
  const m = pathSegment.match(/^match-(\d+)\.ics$/);
  if (!m) return null;
  const matchKey = m[1];

  const { schedule } = await getSchedule(env, ctx);
  const matchNumber = Number(matchKey);
  const match = schedule.matches.find(
    (mt) => String(mt.matchNumber) === matchKey || String(mt.id) === matchKey
  ) ?? schedule.matches.find((mt) => Number.isFinite(mt.matchNumber) && mt.matchNumber === matchNumber);

  if (!match) {
    return new Response("Match not found", { status: 404, headers: CORS });
  }

  const content = buildMatchCalendar(match, schedule.generatedAt, canonicalHost(env));
  return new Response(content, { headers: calendarHeaders() });
}

async function handleFetch(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+/, "");

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }
  if (path === "trigger" && request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }
  if (path !== "trigger" && request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: CORS });
  }

  if (path === "" || path === "schedule.json") {
    return serveSchedule(env, ctx);
  }
  if (path === "knockout.json") {
    return serveKnockout(env, ctx);
  }
  if (path === "calendar.ics") {
    return serveCalendar(env, ctx);
  }
  if (path.startsWith("matches/")) {
    const resp = await serveMatchIcs(env, ctx, path.slice("matches/".length));
    if (resp) return resp;
  }
  if (path === "status") {
    const cached = await readCachedSchedule(env);
    return new Response(
      JSON.stringify({
        ok: !!cached,
        lastUpdated: cached?.schedule.generatedAt ?? null,
        matches: cached?.schedule.matches.length ?? null,
        storage: env.FIFA_BUCKET ? "cache+r2" : "cache"
      }),
      { headers: jsonHeaders("no-store") }
    );
  }
  if (path === "trigger") {
    // 手动触发入口（建议生产环境加 AUTH_TOKEN 校验）
    const token = env.TRIGGER_TOKEN;
    if (token) {
      const bearer = request.headers.get("Authorization");
      if (bearer !== `Bearer ${token}`) {
        return new Response("Forbidden", { status: 403, headers: CORS });
      }
    }
    try {
      const result = await refreshSchedule(env, ctx);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: jsonHeaders("no-store")
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ ok: false, error: String(error?.message ?? error) }),
        { status: 500, headers: jsonHeaders("no-store") }
      );
    }
  }

  return new Response("Not Found", { status: 404, headers: CORS });
}

export default {
  async fetch(request, env, ctx) {
    return handleFetch(request, env, ctx);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(refreshSchedule(env, ctx));
  }
};
