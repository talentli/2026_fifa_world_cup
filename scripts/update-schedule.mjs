// 节点端调度脚本：拉取 FIFA 赛程 → 写入 public/schedule.json、public/calendar.ics 与 public/matches/match-NNN.ics。
// 纯数据/构建逻辑抽到 shared/，Node 与 Cloudflare Worker 共用。

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { fetchFifaMatches, buildSchedulePayload, matchCalendarPath } from "../shared/build-schedule.mjs";

const ROOT = new URL("..", import.meta.url);
const PUBLIC_DIR = new URL("public/", ROOT);
const MATCH_CALENDAR_DIR = new URL("matches/", PUBLIC_DIR);
const SCHEDULE_PATH = new URL("schedule.json", PUBLIC_DIR);
const KNOCKOUT_PATH = new URL("knockout.json", PUBLIC_DIR);
const ICS_PATH = new URL("calendar.ics", PUBLIC_DIR);
const CHECK_MODE = process.argv.includes("--check");
const CANONICAL_HOST = process.env.PUBLIC_CANONICAL_HOST;

async function readExistingSchedule() {
  try {
    return JSON.parse(await readFile(SCHEDULE_PATH, "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });

  const matches = await fetchFifaMatches();
  const generatedAt = new Date().toISOString();
  const { scheduleJson, knockoutJson, calendarIcs, matchCalendars } = buildSchedulePayload({
    matches,
    generatedAt,
    canonicalHost: CANONICAL_HOST
  });

  if (CHECK_MODE) {
    const existing = await readExistingSchedule();
    if (existing && existing.matches?.length !== matches.length) {
      throw new Error(`Existing schedule has ${existing.matches.length} matches; fetched ${matches.length}`);
    }
  }

  await writeFile(SCHEDULE_PATH, scheduleJson);
  await writeFile(KNOCKOUT_PATH, knockoutJson);
  await writeFile(ICS_PATH, calendarIcs);

  await rm(MATCH_CALENDAR_DIR, { recursive: true, force: true });
  await mkdir(MATCH_CALENDAR_DIR, { recursive: true });
  await Promise.all(
    Object.entries(matchCalendars).map(([relPath, content]) =>
      writeFile(new URL(relPath, PUBLIC_DIR), content)
    )
  );

  console.log(`Updated ${matches.length} matches at ${path.relative(process.cwd(), SCHEDULE_PATH.pathname)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
