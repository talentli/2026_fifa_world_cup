# Deployment Guide

本文档描述从空环境到生产发布的完整流程。默认推荐部署为：

- 前端静态站点：Cloudflare Pages、GitHub Pages、Netlify、Vercel 或任意静态托管
- 数据刷新服务：Cloudflare Worker + Cron Trigger
- 可选持久化：Cloudflare R2

## 1. 准备环境

本项目需要 Node.js 22 或更高版本。

```bash
node --version
npm install
npx wrangler --version
```

首次部署 Cloudflare Worker 前先登录：

```bash
npx wrangler login
npx wrangler whoami
```

## 2. 配置公开域名

选择站点最终访问域名，例如：

```text
example.com
```

本项目使用 `PUBLIC_CANONICAL_HOST` 写入 `schedule.json`、`knockout.json` 和所有 ICS 文件。不要带协议和路径。

本地构建示例：

```bash
PUBLIC_CANONICAL_HOST=example.com npm run build
```

Worker 部署时，在 `wrangler.toml` 中设置：

```toml
[vars]
PUBLIC_CANONICAL_HOST = "example.com"
```

## 3. 本地验证

生成静态数据：

```bash
npm run build
```

运行校验：

```bash
npm run test
```

启动静态站点：

```bash
npm run dev
```

启动 Worker：

```bash
npm run worker:dev
```

Worker 本地验证地址：

```text
http://127.0.0.1:8787/schedule.json
http://127.0.0.1:8787/calendar.ics
http://127.0.0.1:8787/status
```

## 4. 部署 Worker

Worker 负责实时拉取 FIFA 数据，并提供以下接口：

| 路径 | 说明 |
| --- | --- |
| `GET /` 或 `GET /schedule.json` | 最新赛程 JSON |
| `GET /knockout.json` | 淘汰赛结构 JSON |
| `GET /calendar.ics` | 全部赛程 ICS |
| `GET /matches/match-001.ics` | 单场 ICS |
| `GET /status` | 缓存状态 |
| `POST /trigger` | 手动刷新 |

生产环境建议设置 `TRIGGER_TOKEN`，保护 `/trigger`：

```bash
npx wrangler secret put TRIGGER_TOKEN
```

### GitHub 自动部署

仓库包含 `.github/workflows/deploy-worker.yml`，当 `main` 分支上的 Worker 相关文件变更时会自动部署。需要在 GitHub 仓库中配置：

| 类型 | 名称 | 值 |
| --- | --- | --- |
| Repository variable | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| Repository secret | `CLOUDFLARE_API_TOKEN` | Cloudflare API Token |

API Token 建议使用最小权限：

- Account: Workers Scripts Edit
- Account: Workers Tail Read（可选，用于日志）
- Account: Account Settings Read

如果使用 Cron Trigger、变量或绑定，确保 token 覆盖 Worker 部署所需权限。

### 手动部署

本地手动部署仍可作为应急路径：

```bash
npm run worker:deploy
```

部署后记录 Worker URL，例如：

```text
https://your-worker.your-subdomain.workers.dev
```

验证：

```bash
curl https://your-worker.your-subdomain.workers.dev/status
curl https://your-worker.your-subdomain.workers.dev/calendar.ics
curl -X POST https://your-worker.your-subdomain.workers.dev/trigger \
  -H "Authorization: Bearer <TRIGGER_TOKEN>"
```

查看实时日志：

```bash
npx wrangler tail
```

## 5. 连接前端到 Worker

打开 `public/index.html`，设置 Worker 地址：

```html
<script>
  window.FIFA_WORKER_BASE_URL = "https://your-worker.your-subdomain.workers.dev";
</script>
```

如果留空，页面会从当前静态站点读取 `schedule.json`、`knockout.json` 和 `calendar.ics`。

改完后重新构建：

```bash
PUBLIC_CANONICAL_HOST=example.com npm run build
```

## 6. 部署静态站点

构建命令：

```bash
npm run build
```

输出目录：

```text
public
```

Cloudflare Pages 配置：

| 配置项 | 值 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `public` |
| Node.js version | `22` |
| Environment variable | `PUBLIC_CANONICAL_HOST=example.com` |

其他静态托管平台使用同样的构建命令和输出目录。

## 7. 可选：启用 R2 持久化

默认情况下 Worker 使用边缘缓存，不要求 R2。需要持久化时先创建 bucket：

```bash
npx wrangler r2 bucket create fifa-2026
```

然后取消 `wrangler.toml` 中 R2 binding 的注释：

```toml
[[r2_buckets]]
binding = "FIFA_BUCKET"
bucket_name = "fifa-2026"
```

重新部署：

```bash
npm run worker:deploy
```

## 8. GitHub Actions 自动更新

仓库包含 `.github/workflows/update-schedule.yml`，会定时执行：

```bash
npm run update
```

如果使用 GitHub Actions 生成静态兜底数据，请在仓库变量中设置：

```text
PUBLIC_CANONICAL_HOST=example.com
```

并确认 workflow 有 `contents: write` 权限。Worker 已经提供 Cron Trigger 时，GitHub Actions 可以作为兜底链路保留，也可以按需关闭。

## 9. 发布前检查

部署前至少执行：

```bash
npm run test
rg -n "TODO|TRIGGER_TOKEN|your-private-domain|your-email|your-worker" .
```

确认：

- `public/index.html` 中的 `FIFA_WORKER_BASE_URL` 指向你的 Worker，或保持空字符串使用静态文件
- `PUBLIC_CANONICAL_HOST` 是你的公开站点域名
- 没有提交 `.wrangler/`、`.env`、token、账号邮箱或私有域名
- `/status` 返回 `ok: true`
- `/calendar.ics` 可以被日历客户端订阅

## 10. 回滚

Worker 回滚：

```bash
npx wrangler versions list
npx wrangler rollback
```

静态站点回滚：

- Cloudflare Pages：在 Pages 项目中选择上一个成功部署并回滚
- GitHub Pages/其他平台：回退到上一个稳定提交后重新部署

## 11. 开源前隐私清理

普通文件树之外，Git 历史和远程地址也可能包含个人信息。公开前建议检查：

```bash
git remote -v
git log --format='%h %an <%ae>' | sort -u
```

如果需要匿名化历史作者信息，请在开源前使用 `git filter-repo` 或重新初始化一个干净仓库。完成后再添加公开仓库远程地址并推送。
