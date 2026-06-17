# 2026 FIFA World Cup Schedule

一个面向中文用户的 2026 世界杯赛程站点，包含赛程列表、小组积分、淘汰赛视图、球队资料和 iCalendar 订阅。

## 项目预览

![项目运行截图](./docs/project-preview.png)

项目可以作为纯静态站点部署，也可以搭配 Cloudflare Worker 定时刷新 FIFA 官方赛程数据。静态兜底文件由构建脚本生成：

- `public/schedule.json`
- `public/knockout.json`
- `public/predictions.json`
- `public/calendar.ics`
- `public/matches/match-*.ics`

## 本地运行

```bash
npm install
npm run build
npm run dev
```

启动后访问本地静态服务输出的地址。

## 配置

构建静态数据时可以通过环境变量设置公开域名，该值会写入 JSON 的 `canonicalHost` 和 ICS 的 `PRODID`/`UID`：

```bash
PUBLIC_CANONICAL_HOST=example.com npm run build
```

如果页面需要读取独立部署的 Worker，请在构建时设置：

```bash
PUBLIC_WORKER_BASE_URL=https://api.example.com npm run build
```

留空时页面会从当前站点读取静态 JSON/ICS 文件。

Cloudflare Pages 部署时如果配置了 `PUBLIC_WORKER_BASE_URL`，Pages Functions 会把
`/schedule.json`、`/knockout.json`、`/predictions.json`、`/calendar.ics` 和 `/matches/match-*.ics`
代理到 Worker，因此同域名下的数据地址也会跟随 Worker 自动刷新。

## AI 预测

页面会读取 `public/predictions.json` 并展示“AI预测”视图。该文件由 Codex 定时任务每天 12:00 调用 `lottery-analyzer` skill 更新，字段约定：

- `generatedAt`：预测生成时间，ISO 字符串或 `null`
- `sourceSkill`：固定为 `lottery-analyzer`
- `predictions[].matchId`：必须对应 `schedule.json` 中的比赛 `id`
- `predictions[].resultTip`：`胜`、`平`、`负` 或 `待定`
- `predictions[].probabilities`：`homeWin`、`draw`、`awayWin`，合计约为 100
- `predictions[].confidenceLevel`：`铁胆级`、`稳胆级`、`大概率`、`中等概率`、`低概率` 或 `待定`
- `predictions[].score`：预测比分，例如 `2:1`
- `predictions[].locked`：已完赛场次必须为 `true`

更新后运行：

```bash
npm run validate:predictions
```

校验会检查比赛 ID、概率范围、主客方向与预测比分的一致性，以及已完赛预测是否锁定。

## 部署

完整流程见 [DEPLOYMENT.md](./DEPLOYMENT.md)。

常用命令：

```bash
npm run test
npm run validate:predictions
npm run worker:dev
npm run worker:deploy
```

## 数据来源

- FIFA 官方赛程：https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures
- 中文赛程参考：https://m.dongqiudi.com/article/5543600.html
