// 构建 schedule / calendar 的纯函数。无 IO，Node 与 Worker 通用。

import {
  FIFA_API,
  TEAM_ZH,
  FLAG_EMOJI,
  TEAM_PROFILES,
  TEAM_EXTRAS,
  MATCH_GOALS,
  LABEL_ZH,
  CITY_ZH
} from "./data.mjs";

export const DEFAULT_CANONICAL_HOST = "2026-fifa-world-cup.example.com";

export const KNOCKOUT_STAGES = [
  { key: "Round of 32", labelZh: "32 强赛" },
  { key: "Round of 16", labelZh: "16 强赛" },
  { key: "Quarter-final", labelZh: "1/4 决赛" },
  { key: "Semi-final", labelZh: "半决赛" },
  { key: "Play-off for third place", labelZh: "三四名决赛" },
  { key: "Final", labelZh: "决赛" }
];

export function normalizeCanonicalHost(value = DEFAULT_CANONICAL_HOST) {
  const host = String(value || DEFAULT_CANONICAL_HOST)
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "");
  return host || DEFAULT_CANONICAL_HOST;
}

function localized(items, fallback = "") {
  if (!Array.isArray(items)) return fallback;
  return items.find((item) => item.Locale === "en-GB")?.Description ?? items[0]?.Description ?? fallback;
}

function zhLabel(value) {
  return LABEL_ZH.get(value) ?? value;
}

function zhCity(value) {
  return CITY_ZH.get(value) ?? value;
}

function normalizeTeam(team) {
  if (!team) {
    return {
      code: "TBD", name: "TBD", nameZh: "待定", flag: "",
      flagEmoji: FLAG_EMOJI.TBD, score: null, penaltyScore: null
    };
  }
  const code = team.Abbreviation || team.IdCountry || "TBD";
  return {
    code,
    name: localized(team.TeamName, team.ShortClubName || code),
    nameZh: TEAM_ZH[code] ?? localized(team.TeamName, team.ShortClubName || code),
    flag: "",
    flagEmoji: FLAG_EMOJI[code] ?? FLAG_EMOJI.TBD,
    score: Number.isFinite(team.Score) ? team.Score : null,
    penaltyScore: null
  };
}

function normalizeMatch(match) {
  const stage = localized(match.StageName, "Unknown");
  const group = localized(match.GroupName, "");
  const city = localized(match.Stadium?.CityName, "");
  const stadium = localized(match.Stadium?.Name, "");
  const home = normalizeTeam(match.Home);
  const away = normalizeTeam(match.Away);
  home.score = Number.isFinite(match.HomeTeamScore) ? match.HomeTeamScore : home.score;
  away.score = Number.isFinite(match.AwayTeamScore) ? match.AwayTeamScore : away.score;
  home.penaltyScore = Number.isFinite(match.HomeTeamPenaltyScore) ? match.HomeTeamPenaltyScore : null;
  away.penaltyScore = Number.isFinite(match.AwayTeamPenaltyScore) ? match.AwayTeamPenaltyScore : null;

  return {
    id: match.IdMatch,
    matchNumber: match.MatchNumber ?? null,
    dateUtc: match.Date,
    localDate: match.LocalDate,
    stage,
    stageZh: zhLabel(stage),
    group,
    groupZh: zhLabel(group),
    status: match.MatchStatus ?? match.MatchTime ?? "",
    matchClock: match.MatchTime ?? "",
    statusText: localized(match.MatchStatusName, ""),
    home,
    away,
    score: {
      home: home.score,
      away: away.score,
      homePenalty: home.penaltyScore,
      awayPenalty: away.penaltyScore
    },
    goals: MATCH_GOALS[match.IdMatch] ?? [],
    venue: {
      stadium,
      city,
      cityZh: zhCity(city),
      country: match.Stadium?.IdCountry ?? ""
    }
  };
}

export function buildTeamProfiles(matches) {
  const teams = {};
  for (const match of matches) {
    for (const side of [match.home, match.away]) {
      if (!side.code || side.code === "TBD") continue;
      const profile = TEAM_PROFILES[side.code] ?? {
        confederation: "国家队",
        intro: `${side.nameZh} 已进入 2026 世界杯赛程，详细阵容和战术看点待后续数据补充。`,
        highlights: ["关注小组赛首战表现。", "关注攻防转换和定位球效率。", "后续可继续补充球员与战术信息。"]
      };
      const extras = TEAM_EXTRAS[side.code] ?? { tier: "世界杯参赛队", starPlayers: [] };

      teams[side.code] = {
        code: side.code, name: side.name, nameZh: side.nameZh, flagEmoji: side.flagEmoji,
        ...profile, ...extras
      };
    }
  }
  return Object.fromEntries(Object.entries(teams).sort(([a], [b]) => a.localeCompare(b)));
}

export async function fetchFifaMatches() {
  const response = await fetch(FIFA_API, {
    headers: {
      accept: "application/json",
      "user-agent": "2026-fifa-world-cup schedule updater"
    }
  });
  if (!response.ok) throw new Error(`FIFA API returned ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload.Results) || payload.Results.length < 100) {
    throw new Error(`FIFA API returned ${payload.Results?.length ?? 0} matches`);
  }
  return payload.Results.map(normalizeMatch).sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc));
}

function toUtcStamp(value) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function matchCalendarPath(match) {
  const number = Number.isFinite(match.matchNumber)
    ? String(match.matchNumber).padStart(3, "0")
    : String(match.id);
  return `matches/match-${number}.ics`;
}

function matchSummary(match) {
  return `${match.home.nameZh} vs ${match.away.nameZh}`;
}

function matchLocation(match) {
  return [match.venue.stadium, match.venue.cityZh || match.venue.city, match.venue.country]
    .filter(Boolean).join(", ");
}

function matchDescription(match) {
  const phase = `${match.stageZh}${match.groupZh ? ` / ${match.groupZh}` : ""}`;
  const number = Number.isFinite(match.matchNumber) ? `第 ${match.matchNumber} 场\n` : "";
  return `${number}${phase}\n北京时间开球\n数据来源: FIFA 官方赛程`;
}

export function buildCalendar(
  matches,
  {
    calendarName = "2026 世界杯赛程",
    generatedAt = new Date().toISOString(),
    canonicalHost = DEFAULT_CANONICAL_HOST
  } = {}
) {
  const host = normalizeCanonicalHost(canonicalHost);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${host}//FIFA World Cup 2026//ZH-CN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
    "X-WR-TIMEZONE:Asia/Shanghai",
    "REFRESH-INTERVAL;VALUE=DURATION:PT10M",
    "X-PUBLISHED-TTL:PT10M"
  ];

  for (const match of matches) {
    const start = new Date(match.dateUtc);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${match.id}@${host}`,
      `DTSTAMP:${toUtcStamp(generatedAt)}`,
      `DTSTART:${toUtcStamp(start)}`,
      `DTEND:${toUtcStamp(end)}`,
      `SUMMARY:${escapeIcs(matchSummary(match))}`,
      `LOCATION:${escapeIcs(matchLocation(match))}`,
      `DESCRIPTION:${escapeIcs(matchDescription(match))}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}

export function buildMatchCalendar(match, generatedAt, canonicalHost = DEFAULT_CANONICAL_HOST) {
  return buildCalendar([match], {
    calendarName: `2026 世界杯 ${matchSummary(match)}`,
    generatedAt,
    canonicalHost
  });
}

export function buildKnockoutPayload(matches, generatedAt, { canonicalHost = DEFAULT_CANONICAL_HOST } = {}) {
  return {
    generatedAt,
    timezone: "Asia/Shanghai",
    canonicalHost: normalizeCanonicalHost(canonicalHost),
    stages: KNOCKOUT_STAGES.map((stage) => ({
      ...stage,
      matches: matches
        .filter((match) => match.stage === stage.key)
        .sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc))
        .map((match) => ({ ...match, calendarPath: matchCalendarPath(match) }))
    })).filter((stage) => stage.matches.length > 0)
  };
}

// 返回 { scheduleJson, knockoutJson, calendarIcs, matchCalendars: { path: content } }
export function buildSchedulePayload({ matches, generatedAt, canonicalHost = DEFAULT_CANONICAL_HOST }) {
  const host = normalizeCanonicalHost(canonicalHost);
  const schedule = {
    generatedAt,
    timezone: "Asia/Shanghai",
    canonicalHost: host,
    sources: [
      {
        name: "FIFA World Cup 2026 match schedule",
        url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures"
      },
      {
        name: "懂球帝中文赛程参考",
        url: "https://m.dongqiudi.com/article/5543600.html"
      }
    ],
    matches: matches.map((match) => ({ ...match, calendarPath: matchCalendarPath(match) })),
    teams: buildTeamProfiles(matches)
  };

  const knockout = buildKnockoutPayload(matches, generatedAt, { canonicalHost: host });
  const calendarIcs = buildCalendar(matches, { generatedAt, canonicalHost: host });

  const matchCalendars = {};
  for (const match of matches) {
    matchCalendars[matchCalendarPath(match)] = buildMatchCalendar(match, generatedAt, host);
  }

  return {
    scheduleJson: JSON.stringify(schedule, null, 2) + "\n",
    knockoutJson: JSON.stringify(knockout, null, 2) + "\n",
    calendarIcs,
    matchCalendars
  };
}
