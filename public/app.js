const state = {
  data: null,
  matches: [],
  teams: {},
  selectedTeamCode: "",
  selectedMatchId: "",
  openGoalMatchId: "",
  view: "fixtures",
  range: "all",
  search: "",
  stage: "",
  group: "",
  date: "",
  teamsSearch: "",
  teamsConfed: "",
  knockoutStage: ""
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
const VIEWS = ["fixtures", "standings", "knockout", "teams"];
const WORKER_BASE_URL = normalizeBaseUrl(window.FIFA_WORKER_BASE_URL || "");
const DATA_BASE_URL = WORKER_BASE_URL || window.location.href;
const SCHEDULE_URL = buildDataUrl("schedule.json");
const KNOCKOUT_URL = buildDataUrl("knockout.json");
const CALENDAR_URL = buildDataUrl("calendar.ics");
const CCTV_URL = "https://worldcup.cctv.com/2026/index.shtml";

const KNOCKOUT_STAGES = [
  { key: "Round of 32", labelZh: "32 强赛" },
  { key: "Round of 16", labelZh: "16 强赛" },
  { key: "Quarter-final", labelZh: "1/4 决赛" },
  { key: "Semi-final", labelZh: "半决赛" },
  { key: "Play-off for third place", labelZh: "三四名决赛" },
  { key: "Final", labelZh: "决赛" }
];

const els = {
  heroNextMatch: document.querySelector("#heroNextMatch"),
  totalMatches: document.querySelector("#totalMatches"),
  finishedMatches: document.querySelector("#finishedMatches"),
  nextMatchTime: document.querySelector("#nextMatchTime"),
  updatedAt: document.querySelector("#updatedAt"),
  searchInput: document.querySelector("#searchInput"),
  stageFilter: document.querySelector("#stageFilter"),
  groupFilter: document.querySelector("#groupFilter"),
  dateFilter: document.querySelector("#dateFilter"),
  teamDetail: document.querySelector("#teamDetail"),
  matchList: document.querySelector("#matchList"),
  copyCalendar: document.querySelector("#copyCalendar"),
  calendarUrl: document.querySelector("#calendarUrl"),
  calendarDownload: document.querySelector("#calendarDownload"),
  scheduleDownload: document.querySelector("#scheduleDownload"),
  viewTabs: document.querySelector("#viewTabs"),
  panels: Object.fromEntries(
    Array.from(document.querySelectorAll(".view-panel")).map((panel) => [panel.dataset.view, panel])
  ),
  standingsGrid: document.querySelector("#standingsGrid"),
  standingsUpdated: document.querySelector("#standingsUpdated"),
  knockoutBoard: document.querySelector("#knockoutBoard"),
  knockoutMobile: document.querySelector("#knockoutMobile"),
  knockoutUpdated: document.querySelector("#knockoutUpdated"),
  teamsGrid: document.querySelector("#teamsGrid"),
  teamsUpdated: document.querySelector("#teamsUpdated"),
  teamsSearchInput: document.querySelector("#teamsSearchInput"),
  confedFilter: document.querySelector("#confedFilter")
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "long",
  day: "numeric",
  weekday: "long"
});

const compactDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit"
});

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function normalizeBaseUrl(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  return value.trim().replace(/\/+$/, "");
}

function buildDataUrl(path) {
  return new URL(path.replace(/^\/+/, ""), `${DATA_BASE_URL.replace(/\/?$/, "/")}`).toString();
}

function shanghaiDateKey(value) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(value));
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function isFinished(match) {
  const status = Number(match.status);
  if (Number.isFinite(status) && status !== 0 && status !== 1) return false;
  return Number.isFinite(match.score.home) && Number.isFinite(match.score.away);
}

function isLive(match, now = new Date()) {
  const status = Number(match.status);
  const start = new Date(match.dateUtc);
  const liveWindowEnd = new Date(start.getTime() + 130 * 60 * 1000);
  if (Number.isFinite(status) && status !== 0 && status !== 1) return true;
  return start <= now && now <= liveWindowEnd;
}

function scoreText(match) {
  const home = Number.isFinite(match.score.home) ? match.score.home : 0;
  const away = Number.isFinite(match.score.away) ? match.score.away : 0;
  return `${home} - ${away}`;
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function searchable(match) {
  return [
    match.home.name,
    match.home.nameZh,
    match.home.code,
    match.away.name,
    match.away.nameZh,
    match.away.code,
    match.stage,
    match.stageZh,
    match.group,
    match.groupZh,
    match.venue.city,
    match.venue.cityZh,
    match.venue.stadium
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchCalendarHref(match) {
  const path = match.calendarPath || `matches/match-${String(match.matchNumber || match.id).padStart(3, "0")}.ics`;
  return buildDataUrl(path);
}

function option(value, label) {
  const item = document.createElement("option");
  item.value = value;
  item.textContent = label;
  return item;
}

function populateFilters(matches) {
  const stages = new Map();
  const groups = new Map();

  for (const match of matches) {
    if (match.stage) stages.set(match.stage, match.stageZh || match.stage);
    if (match.group) groups.set(match.group, match.groupZh || match.group);
  }

  els.stageFilter.querySelectorAll("option:not([value=''])").forEach((node) => node.remove());
  els.groupFilter.querySelectorAll("option:not([value=''])").forEach((node) => node.remove());

  for (const [value, label] of stages) {
    els.stageFilter.append(option(value, label));
  }

  for (const [value, label] of groups) {
    els.groupFilter.append(option(value, label));
  }
}

function updateSummary() {
  const now = new Date();
  const finished = state.matches.filter(isFinished).length;
  const live = state.matches.filter((match) => isLive(match, now));
  const next = state.matches.find((match) => new Date(match.dateUtc) > now && !isFinished(match));

  els.totalMatches.textContent = state.matches.length;
  els.finishedMatches.textContent = finished;
  els.nextMatchTime.textContent = next ? `${compactDateFormatter.format(new Date(next.dateUtc))} ${timeFormatter.format(new Date(next.dateUtc))}` : "暂无";
  const updatedLabel = state.data?.generatedAt
    ? `${compactDateFormatter.format(new Date(state.data.generatedAt))} ${timeFormatter.format(new Date(state.data.generatedAt))}`
    : "--";
  els.updatedAt.textContent = updatedLabel;
  if (els.standingsUpdated) els.standingsUpdated.textContent = `更新于 ${updatedLabel}`;
  if (els.knockoutUpdated) els.knockoutUpdated.textContent = `更新于 ${updatedLabel}`;
  if (els.teamsUpdated) els.teamsUpdated.textContent = `更新于 ${updatedLabel}`;
  updateHeroFeaturedMatch(live[0] || next, live.length > 0);
}

function updateHeroFeaturedMatch(match, live = false) {
  if (!match) {
    els.heroNextMatch.innerHTML = `
      <div class="hero-next-head">
        <span class="hero-tag">比赛动态</span>
      </div>
      <strong class="hero-empty">暂无待赛比赛</strong>
      <span class="hero-time">全部赛程可能已结束</span>
    `;
    return;
  }

  const date = new Date(match.dateUtc);
  const phase = match.groupZh ? `${match.stageZh} · ${match.groupZh}` : match.stageZh;
  const venue = [match.venue.cityZh || match.venue.city, match.venue.stadium].filter(Boolean).join(" · ");
  const label = live ? "进行中比赛" : "下一场比赛";
  const diffMs = date.getTime() - Date.now();
  const showCountdown = !live && diffMs > 0 && diffMs <= 60 * 60 * 1000;
  const statusBadge = live
    ? `<span class="hero-status live">● 直播 ${escapeHtml(match.matchClock || "")}</span>`
    : `<span class="hero-status soon">${dateFormatter.format(date)}</span>`;
  const center = live
    ? `<span class="hero-vs live">${scoreText(match)}</span>`
    : `<div class="hero-vs-wrap">${
        showCountdown
          ? `<span class="hero-countdown" data-kickoff="${date.getTime()}" aria-label="开赛倒计时">${formatCountdown(diffMs)}</span>`
          : ""
      }<span class="hero-vs">VS</span></div>`;
  const timeLine = live
    ? `${escapeHtml(phase)}`
    : `${timeFormatter.format(date)} 北京时间 · ${escapeHtml(phase)}`;

  els.heroNextMatch.innerHTML = `
    <div class="hero-next-head">
      <span class="hero-tag">${escapeHtml(label)}</span>
      ${statusBadge}
    </div>
    <div class="hero-match">
      <div class="hero-team">
        <span class="hero-flag" role="img" aria-label="${escapeHtml(match.home.nameZh)} 队旗">${escapeHtml(match.home.flagEmoji || "◇")}</span>
        <strong>${escapeHtml(match.home.nameZh)}</strong>
        <small>${escapeHtml(match.home.code)}</small>
      </div>
      ${center}
      <div class="hero-team">
        <span class="hero-flag" role="img" aria-label="${escapeHtml(match.away.nameZh)} 队旗">${escapeHtml(match.away.flagEmoji || "◇")}</span>
        <strong>${escapeHtml(match.away.nameZh)}</strong>
        <small>${escapeHtml(match.away.code)}</small>
      </div>
    </div>
    <div class="hero-meta">
      <span class="hero-time">${timeLine}</span>
      <small class="hero-venue">${escapeHtml(venue || "场地待定")}</small>
      <a class="hero-cctv-link" href="${CCTV_URL}" target="_blank" rel="noopener noreferrer">CCTV直播</a>
    </div>
  `;
}

function filteredMatches() {
  const todayKey = shanghaiDateKey(new Date());
  const query = state.search.trim().toLowerCase();
  const now = new Date();

  return state.matches.filter((match) => {
    if (state.stage && match.stage !== state.stage) return false;
    if (state.group && match.group !== state.group) return false;
    if (state.date && shanghaiDateKey(match.dateUtc) !== state.date) return false;
    if (query && !searchable(match).includes(query)) return false;

    if (state.range === "today") return shanghaiDateKey(match.dateUtc) === todayKey;
    if (state.range === "upcoming") return new Date(match.dateUtc) >= now && !isFinished(match);
    if (state.range === "finished") return isFinished(match);
    return true;
  });
}

function teamRow(team, match) {
  const teamUrl = team.code && team.code !== "TBD" ? `#team/${encodeURIComponent(team.code)}/${encodeURIComponent(match.id)}` : "#";
  const disabled = team.code === "TBD" ? " disabled" : "";
  const flag = `<span class="flag" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</span>`;
  return `
    <a class="team-row team-link${disabled}" href="${teamUrl}" data-team-code="${escapeHtml(team.code)}">
      ${flag}
      <div class="team-name">${escapeHtml(team.nameZh)}<small>${escapeHtml(team.name)} · ${escapeHtml(team.code)}</small></div>
    </a>
  `;
}

function matchCard(match) {
  const date = new Date(match.dateUtc);
  const phase = match.groupZh ? `${match.stageZh} · ${match.groupZh}` : match.stageZh;
  const venue = [match.venue.stadium, match.venue.cityZh || match.venue.city].filter(Boolean).join(" · ");
  const finished = isFinished(match);
  const live = !finished && isLive(match);
  const homeScore = Number.isFinite(match.home.score) ? match.home.score : "";
  const awayScore = Number.isFinite(match.away.score) ? match.away.score : "";
  const scoreMarkup = finished
    ? `<button class="score-button" type="button" data-goal-match-id="${escapeHtml(match.id)}" aria-expanded="${state.openGoalMatchId === match.id}"><span>${homeScore}</span><span>${awayScore}</span></button>`
    : live
      ? `<div class="score-stack live"><span>${homeScore}</span><span>${awayScore}</span></div>`
      : `<div class="score-stack"><span>${homeScore}</span><span>${awayScore}</span></div>`;
  const calendarLabel = Number.isFinite(match.matchNumber) ? `订阅第 ${match.matchNumber} 场` : "订阅本场";
  const status = live
    ? `<span class="match-status live">● 进行中 ${escapeHtml(match.matchClock || "")}</span>`
    : finished
      ? `<span class="match-status done">已完赛</span>`
      : `<span class="match-status pending">未开赛</span>`;
  return `
    <article class="match-card${live ? " is-live" : ""}${finished ? " is-finished" : ""}">
      <div class="time-block">
        <strong>${timeFormatter.format(date)}</strong>
        <span>北京时间</span>
        ${status}
      </div>
      <div class="teams">
        ${teamRow(match.home, match)}
        ${teamRow(match.away, match)}
      </div>
      ${scoreMarkup}
      <div class="meta">
        <span class="pill">${phase}</span>
        <span>${venue || "场地待定"}</span>
        <div class="match-actions">
          <a class="calendar-link" href="${escapeHtml(matchCalendarHref(match))}" type="text/calendar" aria-label="${escapeHtml(calendarLabel)}">订阅本场</a>
          <a class="cctv-link" href="${CCTV_URL}" target="_blank" rel="noopener noreferrer" aria-label="打开 CCTV 世界杯页面">CCTV直播</a>
        </div>
      </div>
    </article>
  `;
}

function goalDetails(match) {
  const goals = match.goals || [];
  if (!isFinished(match)) return "";

  if (goals.length === 0) {
    return `
      <section class="goal-details">
        <h3>${escapeHtml(match.home.nameZh)} ${match.score.home} - ${match.score.away} ${escapeHtml(match.away.nameZh)}</h3>
        <p class="goal-empty">进球详情待补充。当前官方赛程接口已同步比分，暂未返回进球事件。</p>
      </section>
    `;
  }

  return `
    <section class="goal-details">
      <h3>${escapeHtml(match.home.nameZh)} ${match.score.home} - ${match.score.away} ${escapeHtml(match.away.nameZh)}</h3>
      <ol>
        ${goals
          .map((goal) => {
            const team = goal.teamCode === match.home.code ? match.home : match.away;
            const shirt = Number.isFinite(goal.shirtNumber) ? `#${goal.shirtNumber}` : "号码待补充";
            const ownGoal = goal.ownGoal ? " 乌龙球" : "";
            const assist = goal.assist ? `<small>助攻：${escapeHtml(goal.assist)}</small>` : "";
            return `
              <li>
                <time>${escapeHtml(goal.minute)}</time>
                <span class="flag" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</span>
                <strong>${escapeHtml(shirt)} ${escapeHtml(goal.player)}${ownGoal}</strong>
                ${assist}
              </li>
            `;
          })
          .join("")}
      </ol>
    </section>
  `;
}

function matchMini(match) {
  const date = new Date(match.dateUtc);
  const phase = match.groupZh ? `${match.stageZh} · ${match.groupZh}` : match.stageZh;
  const score =
    Number.isFinite(match.score.home) && Number.isFinite(match.score.away)
      ? `${match.score.home} - ${match.score.away}`
      : timeFormatter.format(date);

  return `
    <li>
      <span>${dateFormatter.format(date)} ${timeFormatter.format(date)}</span>
      <strong>${escapeHtml(match.home.nameZh)} ${score} ${escapeHtml(match.away.nameZh)}</strong>
      <small>${escapeHtml(phase)} · ${escapeHtml(match.venue.cityZh || match.venue.city || "场地待定")}</small>
    </li>
  `;
}

function teamDetailHtml() {
  const code = state.selectedTeamCode;
  const team = code ? state.teams[code] : null;

  if (!team) return "";

  const matches = state.matches.filter((match) => match.home.code === code || match.away.code === code);
  const groups = [...new Set(matches.map((match) => match.groupZh).filter(Boolean))].join(" / ") || "淘汰赛待定";
  const cities = [...new Set(matches.map((match) => match.venue.cityZh || match.venue.city).filter(Boolean))].join("、");

  return `
    <section class="team-detail" id="team-detail-${escapeHtml(code)}">
      <div class="team-hero">
      <div class="team-badge" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</div>
      <div>
        <p class="eyebrow dark">${escapeHtml(team.confederation || "国家队")}</p>
        <h2>${escapeHtml(team.nameZh)} <span>${escapeHtml(team.name)}</span></h2>
        <div class="team-tags">
          <span>${escapeHtml(team.tier || "世界杯参赛队")}</span>
          ${(team.starPlayers || []).slice(0, 4).map((player) => `<span>${escapeHtml(player)}</span>`).join("")}
        </div>
        <p>${escapeHtml(team.intro)}</p>
      </div>
      <a class="close-detail" href="#" aria-label="关闭球队详情">关闭</a>
      </div>
      <div class="team-info-grid">
      <div>
        <h3>球队看点</h3>
        <ul class="story-list">
          ${(team.highlights || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <div>
        <h3>小组与行程</h3>
        <dl class="fact-list">
          <div><dt>分组</dt><dd>${escapeHtml(groups)}</dd></div>
          <div><dt>比赛城市</dt><dd>${escapeHtml(cities || "待定")}</dd></div>
          <div><dt>小组赛</dt><dd>${matches.length ? `${matches.length} 场已排定` : "待定"}</dd></div>
        </dl>
      </div>
      <div>
        <h3>赛程</h3>
        <ul class="team-schedule">${matches.map(matchMini).join("")}</ul>
      </div>
      </div>
    </section>
  `;
}

function renderFixtures() {
  els.teamDetail.hidden = true;
  els.teamDetail.innerHTML = "";
  const matches = filteredMatches();
  const groups = new Map();

  for (const match of matches) {
    const key = shanghaiDateKey(match.dateUtc);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(match);
  }

  if (matches.length === 0) {
    els.matchList.innerHTML = `<div class="empty">没有匹配的赛程。</div>`;
    return;
  }

  let detailRendered = false;
  const selectedVisibleMatch =
    matches.find((match) => match.id === state.selectedMatchId && (match.home.code === state.selectedTeamCode || match.away.code === state.selectedTeamCode)) ||
    matches.find((match) => match.home.code === state.selectedTeamCode || match.away.code === state.selectedTeamCode);

  els.matchList.innerHTML = [...groups.entries()]
    .map(([key, items]) => {
      const date = new Date(items[0].dateUtc);
      return `
        <div class="date-group">
          <div class="date-title">
            <h2>${dateFormatter.format(date)}</h2>
            <span>${key} · ${items.length} 场</span>
          </div>
          ${items
            .map((match) => {
              const shouldRenderDetail = !detailRendered && selectedVisibleMatch && match.id === selectedVisibleMatch.id;
              if (shouldRenderDetail) detailRendered = true;
              const shouldRenderGoals = state.openGoalMatchId === match.id;
              return `${shouldRenderDetail ? teamDetailHtml() : ""}${matchCard(match)}${shouldRenderGoals ? goalDetails(match) : ""}`;
            })
            .join("")}
        </div>
      `;
    })
    .join("");
}

// ---------- Standings ----------

function computeStandings(matches) {
  const groupTeams = new Map(); // group -> Map(code -> stats)
  const groupMatches = new Map(); // group -> matches[]
  const groupZh = new Map();

  for (const match of matches) {
    if (match.stage !== "First Stage" || !match.group) continue;
    if (!groupTeams.has(match.group)) {
      groupTeams.set(match.group, new Map());
      groupMatches.set(match.group, []);
      groupZh.set(match.group, match.groupZh || match.group);
    }
    groupMatches.get(match.group).push(match);
    const teamMap = groupTeams.get(match.group);
    for (const side of [match.home, match.away]) {
      if (!side.code || side.code === "TBD") continue;
      if (!teamMap.has(side.code)) {
        teamMap.set(side.code, {
          code: side.code,
          name: side.name,
          nameZh: side.nameZh,
          flagEmoji: side.flagEmoji,
          played: 0,
          win: 0,
          draw: 0,
          loss: 0,
          gf: 0,
          ga: 0,
          points: 0
        });
      }
    }
  }

  for (const [groupKey, list] of groupMatches) {
    const teamMap = groupTeams.get(groupKey);
    for (const match of list) {
      if (!isFinished(match)) continue;
      const home = teamMap.get(match.home.code);
      const away = teamMap.get(match.away.code);
      if (!home || !away) continue;
      home.played += 1;
      away.played += 1;
      home.gf += match.score.home;
      home.ga += match.score.away;
      away.gf += match.score.away;
      away.ga += match.score.home;
      if (match.score.home > match.score.away) {
        home.win += 1;
        home.points += 3;
        away.loss += 1;
      } else if (match.score.home < match.score.away) {
        away.win += 1;
        away.points += 3;
        home.loss += 1;
      } else {
        home.draw += 1;
        away.draw += 1;
        home.points += 1;
        away.points += 1;
      }
    }
  }

  const groups = [...groupTeams.entries()]
    .map(([groupKey, teamMap]) => {
      const teams = [...teamMap.values()].map((team) => ({ ...team, gd: team.gf - team.ga }));
      teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.nameZh.localeCompare(b.nameZh, "zh");
      });
      return {
        key: groupKey,
        keyZh: groupZh.get(groupKey) || groupKey,
        teams
      };
    })
    .sort((a, b) => a.key.localeCompare(b.key));

  // Rank third-placed teams across groups (top 8 of 12 advance for 48-team format).
  const thirds = groups
    .map((group) => {
      const team = group.teams[2];
      return team ? { ...team, group: group.key, groupZh: group.keyZh } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.nameZh.localeCompare(b.nameZh, "zh");
    });

  const thirdQualified = new Set(thirds.slice(0, 8).map((team) => `${team.group}:${team.code}`));

  return { groups, thirds, thirdQualified };
}

function standingsRow(team, index, thirdQualified, groupKey) {
  const isTop2 = index < 2;
  const isThird = index === 2;
  const isQualifiedThird = isThird && thirdQualified.has(`${groupKey}:${team.code}`);
  const cls = ["standings-row"];
  if (isTop2) cls.push("qualified");
  if (isQualifiedThird) cls.push("qualified third");
  if (isThird && !isQualifiedThird) cls.push("border-third");
  const teamUrl = `#team/${encodeURIComponent(team.code)}`;
  return `
    <a class="${cls.join(" ")}" href="${teamUrl}">
      <span class="rank">${index + 1}</span>
      <span class="team">
        <span class="flag" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</span>
        <span class="team-name-cell">
          <strong>${escapeHtml(team.nameZh)}</strong>
          <small>${escapeHtml(team.code)}</small>
        </span>
      </span>
      <span class="num">${team.played}</span>
      <span class="num">${team.win}</span>
      <span class="num">${team.draw}</span>
      <span class="num">${team.loss}</span>
      <span class="num">${team.gf}</span>
      <span class="num">${team.ga}</span>
      <span class="num">${team.gd > 0 ? "+" + team.gd : team.gd}</span>
      <span class="num pts">${team.points}</span>
    </a>
  `;
}

function renderStandings() {
  const { groups, thirds, thirdQualified } = computeStandings(state.matches);
  if (!groups.length) {
    els.standingsGrid.innerHTML = `<div class="empty">暂无积分榜数据。</div>`;
    return;
  }

  const tables = groups
    .map((group) => `
      <article class="standings-card">
        <header>
          <h3>${escapeHtml(group.keyZh)}</h3>
          <span>${group.teams.length} 队</span>
        </header>
        <div class="standings-table">
          <div class="standings-head">
            <span class="rank">#</span>
            <span class="team">球队</span>
            <span class="num" title="赛">赛</span>
            <span class="num" title="胜">胜</span>
            <span class="num" title="平">平</span>
            <span class="num" title="负">负</span>
            <span class="num" title="进球">进</span>
            <span class="num" title="失球">失</span>
            <span class="num" title="净胜">净</span>
            <span class="num pts" title="积分">分</span>
          </div>
          ${group.teams.map((team, index) => standingsRow(team, index, thirdQualified, group.key)).join("")}
        </div>
      </article>
    `)
    .join("");

  const thirdPanel = thirds.length
    ? `
      <article class="standings-card third-card">
        <header>
          <h3>各组第三名排名</h3>
          <span>前 8 位晋级</span>
        </header>
        <div class="standings-table thirds">
          <div class="standings-head">
            <span class="rank">#</span>
            <span class="team">球队</span>
            <span class="num">组</span>
            <span class="num">赛</span>
            <span class="num">胜</span>
            <span class="num">平</span>
            <span class="num">负</span>
            <span class="num">净</span>
            <span class="num pts">分</span>
          </div>
          ${thirds
            .map(
              (team, index) => `
              <a class="standings-row${index < 8 ? " qualified third" : ""}" href="#team/${encodeURIComponent(team.code)}">
                <span class="rank">${index + 1}</span>
                <span class="team">
                  <span class="flag" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</span>
                  <span class="team-name-cell">
                    <strong>${escapeHtml(team.nameZh)}</strong>
                    <small>${escapeHtml(team.code)}</small>
                  </span>
                </span>
                <span class="num">${escapeHtml((team.groupZh || team.group).replace(" 组", ""))}</span>
                <span class="num">${team.played}</span>
                <span class="num">${team.win}</span>
                <span class="num">${team.draw}</span>
                <span class="num">${team.loss}</span>
                <span class="num">${team.gd > 0 ? "+" + team.gd : team.gd}</span>
                <span class="num pts">${team.points}</span>
              </a>`
            )
            .join("")}
        </div>
      </article>`
    : "";

  els.standingsGrid.innerHTML = tables + thirdPanel;
}

// ---------- Knockout ----------

function knockoutMatchCard(match) {
  const date = new Date(match.dateUtc);
  const finished = isFinished(match);
  const live = !finished && isLive(match);
  const home = match.home;
  const away = match.away;
  const scoreLine =
    finished || live
      ? `<span class="ko-score${live ? " live" : ""}">${Number.isFinite(match.score.home) ? match.score.home : 0} - ${Number.isFinite(match.score.away) ? match.score.away : 0}</span>`
      : "";
  const venue = [match.venue.cityZh || match.venue.city, match.venue.stadium].filter(Boolean).join(" · ");
  const winnerSide = finished
    ? match.score.home > match.score.away
      ? "home"
      : match.score.away > match.score.home
        ? "away"
        : ""
    : "";
  const status = live ? `<span class="ko-tag live">● 进行中 ${escapeHtml(match.matchClock || "")}</span>` : finished ? `<span class="ko-tag done">已完赛</span>` : `<span class="ko-tag pending">${compactDateFormatter.format(date)}</span>`;
  const calendarLabel = Number.isFinite(match.matchNumber) ? `订阅第 ${match.matchNumber} 场` : "订阅本场";
  return `
    <article class="ko-card${live ? " is-live" : ""}${finished ? " is-finished" : ""}">
      <header>
        <span class="ko-id">Match ${match.matchNumber || "-"}</span>
        ${status}
      </header>
      <time class="ko-time" datetime="${escapeHtml(match.dateUtc)}">${dateFormatter.format(date)} ${timeFormatter.format(date)}</time>
      <div class="ko-row${winnerSide === "home" ? " win" : winnerSide === "away" ? " lose" : ""}">
        <span class="flag">${escapeHtml(home.flagEmoji || "◇")}</span>
        <span class="ko-name">${escapeHtml(home.nameZh)}</span>
        <span class="ko-code">${escapeHtml(home.code)}</span>
      </div>
      ${scoreLine ? `<div class="ko-mid">${scoreLine}</div>` : ""}
      <div class="ko-row${winnerSide === "away" ? " win" : winnerSide === "home" ? " lose" : ""}">
        <span class="flag">${escapeHtml(away.flagEmoji || "◇")}</span>
        <span class="ko-name">${escapeHtml(away.nameZh)}</span>
        <span class="ko-code">${escapeHtml(away.code)}</span>
      </div>
      <footer>
        <span>${escapeHtml(venue || "场地待定")}</span>
        <span class="ko-links">
          <a href="${escapeHtml(matchCalendarHref(match))}" type="text/calendar" aria-label="${escapeHtml(calendarLabel)}">订阅</a>
          <a href="${CCTV_URL}" target="_blank" rel="noopener noreferrer">CCTV</a>
        </span>
      </footer>
    </article>
  `;
}

function defaultKnockoutStage(stages) {
  if (!stages.length) return "";
  const now = new Date();
  const liveStage = stages.find((stage) => stage.matches.some((match) => isLive(match, now)));
  if (liveStage) return liveStage.key;
  const upcomingStage = stages.find((stage) => stage.matches.some((match) => new Date(match.dateUtc) >= now && !isFinished(match)));
  return upcomingStage?.key || stages[0].key;
}

function knockoutMobileCard(match, stage) {
  const date = new Date(match.dateUtc);
  const finished = isFinished(match);
  const live = !finished && isLive(match);
  const score = finished || live ? scoreText(match) : "VS";
  const venue = [match.venue.cityZh || match.venue.city, match.venue.stadium].filter(Boolean).join(" · ");
  const status = live ? `进行中 ${match.matchClock || ""}` : finished ? "已完赛" : "未开赛";
  const nextHint = stage.key === "Final" ? "冠军归属" : stage.key === "Play-off for third place" ? "三四名排位" : "胜者晋级下一轮";
  const calendarLabel = Number.isFinite(match.matchNumber) ? `订阅第 ${match.matchNumber} 场` : "订阅本场";

  return `
    <article class="ko-mobile-card${live ? " is-live" : ""}${finished ? " is-finished" : ""}">
      <header>
        <time datetime="${escapeHtml(match.dateUtc)}">${dateFormatter.format(date)} ${timeFormatter.format(date)}</time>
        <span>${escapeHtml(status)}</span>
      </header>
      <div class="ko-mobile-teams">
        <div>
          <span class="flag">${escapeHtml(match.home.flagEmoji || "◇")}</span>
          <strong>${escapeHtml(match.home.nameZh)}</strong>
          <small>${escapeHtml(match.home.code)}</small>
        </div>
        <span class="ko-mobile-score">${escapeHtml(score)}</span>
        <div>
          <span class="flag">${escapeHtml(match.away.flagEmoji || "◇")}</span>
          <strong>${escapeHtml(match.away.nameZh)}</strong>
          <small>${escapeHtml(match.away.code)}</small>
        </div>
      </div>
      <footer>
        <span>${escapeHtml(venue || "场地待定")}</span>
        <span>${escapeHtml(nextHint)}</span>
        <div class="ko-mobile-actions">
          <a href="${escapeHtml(matchCalendarHref(match))}" type="text/calendar" aria-label="${escapeHtml(calendarLabel)}">订阅</a>
          <a href="${CCTV_URL}" target="_blank" rel="noopener noreferrer">CCTV</a>
        </div>
      </footer>
    </article>
  `;
}

function renderKnockoutMobile(stages) {
  if (!els.knockoutMobile) return;
  if (!stages.length) {
    els.knockoutMobile.innerHTML = `<div class="empty">淘汰赛对阵尚未确定。</div>`;
    return;
  }

  if (!state.knockoutStage || !stages.some((stage) => stage.key === state.knockoutStage)) {
    state.knockoutStage = defaultKnockoutStage(stages);
  }

  const activeStage = stages.find((stage) => stage.key === state.knockoutStage) || stages[0];
  els.knockoutMobile.innerHTML = `
    <div class="ko-mobile-tabs" role="tablist" aria-label="淘汰赛轮次">
      ${stages
        .map(
          (stage) => `
            <button class="${stage.key === activeStage.key ? "active" : ""}" data-ko-stage="${escapeHtml(stage.key)}" type="button" role="tab" aria-selected="${stage.key === activeStage.key ? "true" : "false"}">
              <span>${escapeHtml(stage.labelZh)}</span>
              <small>${stage.matches.length} 场</small>
            </button>
          `
        )
        .join("")}
    </div>
    <div class="ko-mobile-stage-head">
      <h3>${escapeHtml(activeStage.labelZh)}</h3>
      <span>${activeStage.matches.length} 场比赛</span>
    </div>
    <div class="ko-mobile-list">
      ${activeStage.matches.map((match) => knockoutMobileCard(match, activeStage)).join("")}
    </div>
  `;
}

function renderKnockout() {
  const stages = KNOCKOUT_STAGES.map((stage) => {
    const matches = state.matches
      .filter((match) => match.stage === stage.key)
      .sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc));
    return { ...stage, matches };
  }).filter((stage) => stage.matches.length > 0);

  if (!stages.length) {
    els.knockoutBoard.innerHTML = `<div class="empty">淘汰赛对阵尚未确定。</div>`;
    if (els.knockoutMobile) els.knockoutMobile.innerHTML = `<div class="empty">淘汰赛对阵尚未确定。</div>`;
    return;
  }

  els.knockoutBoard.innerHTML = stages
    .map(
      (stage) => `
        <section class="ko-column" data-stage="${escapeHtml(stage.key)}">
          <header class="ko-column-head">
            <h3>${escapeHtml(stage.labelZh)}</h3>
            <span>${stage.matches.length} 场</span>
          </header>
          <div class="ko-list">${stage.matches.map(knockoutMatchCard).join("")}</div>
        </section>
      `
    )
    .join("");

  renderKnockoutMobile(stages);
}

// ---------- Teams ----------

function teamMatchSummary(team, matches) {
  const teamMatches = matches
    .filter((match) => match.home.code === team.code || match.away.code === team.code)
    .sort((a, b) => new Date(a.dateUtc) - new Date(b.dateUtc));
  const now = new Date();
  let win = 0;
  let draw = 0;
  let loss = 0;
  let played = 0;
  for (const match of teamMatches) {
    if (!isFinished(match)) continue;
    played += 1;
    const isHome = match.home.code === team.code;
    const ours = isHome ? match.score.home : match.score.away;
    const theirs = isHome ? match.score.away : match.score.home;
    if (ours > theirs) win += 1;
    else if (ours === theirs) draw += 1;
    else loss += 1;
  }
  const next = teamMatches.find((match) => !isFinished(match) && new Date(match.dateUtc) >= now) || teamMatches.find((match) => !isFinished(match));
  const groupZh = teamMatches.map((match) => match.groupZh).find(Boolean) || "淘汰赛待定";
  return { teamMatches, played, win, draw, loss, next, groupZh };
}

function teamCard(team) {
  const summary = teamMatchSummary(team, state.matches);
  const next = summary.next;
  const nextLabel = next
    ? `${compactDateFormatter.format(new Date(next.dateUtc))} ${timeFormatter.format(new Date(next.dateUtc))} · 对阵 ${escapeHtml(
        next.home.code === team.code ? next.away.nameZh : next.home.nameZh
      )}`
    : "本届赛程已结束";
  return `
    <a class="team-card" href="#team/${encodeURIComponent(team.code)}">
      <div class="team-card-head">
        <span class="flag" role="img" aria-label="${escapeHtml(team.nameZh)} 队旗">${escapeHtml(team.flagEmoji || "◇")}</span>
        <div>
          <strong>${escapeHtml(team.nameZh)}</strong>
          <span>${escapeHtml(team.name)} · ${escapeHtml(team.code)}</span>
        </div>
        <em>${escapeHtml(summary.groupZh)}</em>
      </div>
      <p class="team-card-confed">${escapeHtml(team.confederation || "国家队")}</p>
      <p class="team-card-intro">${escapeHtml(team.intro || "")}</p>
      <div class="team-card-stats">
        <div><span>${summary.played}</span><small>赛</small></div>
        <div><span>${summary.win}</span><small>胜</small></div>
        <div><span>${summary.draw}</span><small>平</small></div>
        <div><span>${summary.loss}</span><small>负</small></div>
      </div>
      <p class="team-card-next">下一场：${nextLabel}</p>
    </a>
  `;
}

function renderTeams() {
  const teams = Object.values(state.teams);
  if (!teams.length) {
    els.teamsGrid.innerHTML = `<div class="empty">暂无球队数据。</div>`;
    return;
  }

  const query = state.teamsSearch.trim().toLowerCase();
  const confed = state.teamsConfed;

  const filtered = teams
    .filter((team) => {
      if (confed && !(team.confederation || "").includes(confed)) return false;
      if (!query) return true;
      const haystack = [team.name, team.nameZh, team.code, team.confederation, team.tier].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => a.nameZh.localeCompare(b.nameZh, "zh"));

  if (!filtered.length) {
    els.teamsGrid.innerHTML = `<div class="empty">没有符合条件的球队。</div>`;
    return;
  }

  els.teamsGrid.innerHTML = filtered.map(teamCard).join("");
}

// ---------- Render dispatcher ----------

function setView(view) {
  if (!VIEWS.includes(view)) view = "fixtures";
  state.view = view;
  document.querySelectorAll(".view-tab").forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
  for (const [key, panel] of Object.entries(els.panels)) {
    panel.hidden = key !== view;
  }
}

function render() {
  if (state.view === "fixtures") renderFixtures();
  else if (state.view === "standings") renderStandings();
  else if (state.view === "knockout") renderKnockout();
  else if (state.view === "teams") renderTeams();
}

function bindEvents() {
  window.addEventListener("hashchange", () => {
    syncRoute();
    if (state.selectedTeamCode && state.view !== "fixtures") setView("fixtures");
    render();
  });

  els.viewTabs.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-view]");
    if (!tab) return;
    setView(tab.dataset.view);
    render();
  });

  if (els.knockoutMobile) {
    els.knockoutMobile.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-ko-stage]");
      if (!tab) return;
      state.knockoutStage = tab.dataset.koStage;
      renderKnockout();
    });
  }

  els.matchList.addEventListener("click", (event) => {
    const scoreButton = event.target.closest("[data-goal-match-id]");
    if (scoreButton) {
      const matchId = scoreButton.dataset.goalMatchId;
      state.openGoalMatchId = state.openGoalMatchId === matchId ? "" : matchId;
      render();
      return;
    }

    const close = event.target.closest(".close-detail");
    if (!close) return;
    event.preventDefault();
    history.pushState("", document.title, window.location.pathname + window.location.search);
    state.selectedTeamCode = "";
    state.selectedMatchId = "";
    render();
  });

  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    render();
  });

  els.stageFilter.addEventListener("change", (event) => {
    state.stage = event.target.value;
    render();
  });

  els.groupFilter.addEventListener("change", (event) => {
    state.group = event.target.value;
    render();
  });

  els.dateFilter.addEventListener("change", (event) => {
    state.date = event.target.value;
    render();
  });

  document.querySelectorAll('#viewFixtures .segmented .segment').forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll('#viewFixtures .segmented .segment').forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.range = button.dataset.range;
      render();
    });
  });

  els.copyCalendar.addEventListener("click", async () => {
    await navigator.clipboard.writeText(els.calendarUrl.textContent);
    els.copyCalendar.textContent = "已复制";
    setTimeout(() => {
      els.copyCalendar.textContent = "复制";
    }, 1400);
  });

  if (els.teamsSearchInput) {
    els.teamsSearchInput.addEventListener("input", (event) => {
      state.teamsSearch = event.target.value;
      if (state.view === "teams") renderTeams();
    });
  }

  if (els.confedFilter) {
    els.confedFilter.addEventListener("click", (event) => {
      const button = event.target.closest("[data-confed]");
      if (!button) return;
      els.confedFilter.querySelectorAll(".segment").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.teamsConfed = button.dataset.confed || "";
      if (state.view === "teams") renderTeams();
    });
  }
}

function syncRoute() {
  const teamMatch = window.location.hash.match(/^#team\/([A-Z0-9]+)(?:\/([^/]+))?$/i);
  state.selectedTeamCode = teamMatch ? decodeURIComponent(teamMatch[1]).toUpperCase() : "";
  state.selectedMatchId = teamMatch?.[2] ? decodeURIComponent(teamMatch[2]) : "";
  if (state.selectedTeamCode) state.view = "fixtures";
}

async function loadSchedule() {
  const response = await fetch(SCHEDULE_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load schedule: ${response.status}`);
  state.data = await response.json();
  state.matches = state.data.matches;
  state.teams = state.data.teams || {};
  populateFilters(state.matches);
  updateSummary();
  render();
}

async function init() {
  syncRoute();
  setView(state.view);
  await loadSchedule();
  els.calendarUrl.textContent = CALENDAR_URL;
  if (els.calendarDownload) els.calendarDownload.href = CALENDAR_URL;
  if (els.scheduleDownload) els.scheduleDownload.href = SCHEDULE_URL;
  bindEvents();
  setInterval(() => {
    loadSchedule().catch((error) => console.error("Schedule refresh failed", error));
  }, REFRESH_INTERVAL_MS);
  setInterval(tickHeroCountdown, 1000);
}

function tickHeroCountdown() {
  const cd = document.querySelector(".hero-countdown[data-kickoff]");
  if (!cd) return;
  const kickoff = Number(cd.dataset.kickoff);
  if (!Number.isFinite(kickoff)) return;
  const diff = kickoff - Date.now();
  if (diff <= 0) {
    updateSummary();
    return;
  }
  if (diff > 60 * 60 * 1000) {
    cd.remove();
    return;
  }
  cd.textContent = formatCountdown(diff);
}

init().catch((error) => {
  console.error(error);
  els.matchList.innerHTML = `<div class="empty">赛程加载失败，请稍后重试。</div>`;
});
