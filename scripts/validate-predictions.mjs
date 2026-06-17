import { readFile } from "node:fs/promises";

const ROOT = new URL("..", import.meta.url);
const SCHEDULE_PATH = new URL("public/schedule.json", ROOT);
const PREDICTIONS_PATH = new URL("public/predictions.json", ROOT);
const TIP_VALUES = new Set(["胜", "平", "负", "待定"]);
const LEVEL_VALUES = new Set(["铁胆级", "稳胆级", "大概率", "中等概率", "低概率", "待定"]);

function fail(message) {
  throw new Error(`predictions.json validation failed: ${message}`);
}

function isFinished(match) {
  const status = Number(match.status);
  if (Number.isFinite(status) && status !== 0 && status !== 1) return false;
  return Number.isFinite(match.score?.home) && Number.isFinite(match.score?.away);
}

function readScore(score) {
  if (typeof score !== "string" || !score.trim()) return null;
  const match = score.trim().match(/^(\d+)\s*[:：-]\s*(\d+)$/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function validateProbability(value, label, prediction) {
  const num = Number(value);
  if (!Number.isFinite(num)) fail(`${prediction.matchId} ${label} must be a number`);
  if (num < 0 || num > 100) fail(`${prediction.matchId} ${label} must be between 0 and 100`);
  return num;
}

function validateScoreDirection(prediction) {
  const score = readScore(prediction.score);
  if (!score || prediction.resultTip === "待定") return;
  if (prediction.resultTip === "胜" && score.home <= score.away) {
    fail(`${prediction.matchId} resultTip=胜 requires home score > away score`);
  }
  if (prediction.resultTip === "平" && score.home !== score.away) {
    fail(`${prediction.matchId} resultTip=平 requires equal score`);
  }
  if (prediction.resultTip === "负" && score.home >= score.away) {
    fail(`${prediction.matchId} resultTip=负 requires home score < away score`);
  }
}

async function main() {
  const [schedule, payload] = await Promise.all([
    readFile(SCHEDULE_PATH, "utf8").then(JSON.parse),
    readFile(PREDICTIONS_PATH, "utf8").then(JSON.parse)
  ]);
  const matches = new Map((schedule.matches || []).map((match) => [String(match.id), match]));

  if (!Array.isArray(payload.predictions)) fail("predictions must be an array");
  if (payload.generatedAt !== null && Number.isNaN(new Date(payload.generatedAt).getTime())) {
    fail("generatedAt must be null or an ISO date");
  }
  if (payload.timezone !== "Asia/Shanghai") fail("timezone must be Asia/Shanghai");

  const seen = new Set();
  for (const prediction of payload.predictions) {
    if (!prediction || typeof prediction !== "object") fail("each prediction must be an object");
    const matchId = String(prediction.matchId || "");
    if (!matchId) fail("matchId is required");
    if (seen.has(matchId)) fail(`${matchId} is duplicated`);
    seen.add(matchId);

    const match = matches.get(matchId);
    if (!match) fail(`${matchId} does not exist in schedule.json`);
    if (!TIP_VALUES.has(prediction.resultTip)) fail(`${matchId} resultTip is invalid`);
    if (!LEVEL_VALUES.has(prediction.confidenceLevel)) fail(`${matchId} confidenceLevel is invalid`);
    if (isFinished(match) && prediction.locked !== true) fail(`${matchId} is finished and must be locked`);

    const probs = prediction.probabilities || {};
    const home = validateProbability(probs.homeWin, "probabilities.homeWin", prediction);
    const draw = validateProbability(probs.draw, "probabilities.draw", prediction);
    const away = validateProbability(probs.awayWin, "probabilities.awayWin", prediction);
    const sum = home + draw + away;
    if (Math.abs(sum - 100) > 1) fail(`${matchId} probabilities must sum to 100 (+/-1), got ${sum}`);

    validateScoreDirection(prediction);

    if (typeof prediction.rationale !== "string" || prediction.rationale.trim().length < 20) {
      fail(`${matchId} rationale must explain the prediction`);
    }
    if (typeof prediction.sourceSummary !== "string" || prediction.sourceSummary.trim().length < 6) {
      fail(`${matchId} sourceSummary is required`);
    }
  }

  console.log(`Validated ${payload.predictions.length} predictions`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
