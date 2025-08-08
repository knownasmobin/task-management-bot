# Task Management Bot

Telegram Mini App with a Node.js backend for team tasks, deadlines, and Telegram notifications.

## Features
- Telegram webhook endpoint at `/webhook` (with optional secret verification)
- Simple web UI served at `/` (works inside Telegram in-app browser)
- Health and stats endpoints: `/api/health`, `/api/webhook/stats`
- Sensible security defaults: Helmet, CORS, rate limiting, compression

## Requirements
- Node.js 18+ (recommended) and npm 8+
- A Telegram Bot token from BotFather
- A publicly reachable URL for webhooks in production (HTTPS)

## Quickstart (Windows PowerShell)
1) Copy env template and install dependencies
	- Copy `.env.example` to `.env`
	- Install packages
2) Run the server
	- Start dev server on http://localhost:3000

```powershell
Copy-Item .env.example .env -Force
npm install
npm run dev
```

## Environment variables
Required:
- TELEGRAM_BOT_TOKEN — Bot token from BotFather
- APP_URL — Public base URL of your app (e.g., https://your-domain)
- TELEGRAM_WEBHOOK_SECRET — Shared secret to verify Telegram webhook calls

Useful optionals:
- PORT — Defaults to 3000
- ALLOWED_ORIGINS — Comma-separated list for CORS (default allows all)
- APP_VERSION — Shown in `/api/health`

## Set the Telegram webhook
Point Telegram to your webhook endpoint using the same secret.

PowerShell:
```powershell
$body = @{ url = "https://YOUR_DOMAIN/webhook"; secret_token = "$env:TELEGRAM_WEBHOOK_SECRET" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://api.telegram.org/bot$env:TELEGRAM_BOT_TOKEN/setWebhook" -ContentType 'application/json' -Body $body
```

curl (optional):
```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://YOUR_DOMAIN/webhook","secret_token":"YOUR_WEBHOOK_SECRET"}'
```

## Run and endpoints
- App: http://localhost:3000
- Webhook: http://localhost:3000/webhook
- Health: http://localhost:3000/api/health
- Webhook stats: http://localhost:3000/api/webhook/stats

Scripts:
- npm run dev — start dev server (nodemon)
- npm start — start in production mode (node)
- npm test / npm run test:coverage — run tests and coverage
- npm run lint — run ESLint

## Docker
Build and run locally:
```powershell
docker build -t telegram-task-manager .
docker run -p 3000:3000 --env-file .env telegram-task-manager
```

Development compose (hot reload):
```powershell
npm run compose:dev
npm run compose:logs
npm run compose:down
```

Production compose:
```powershell
npm run compose:prod
npm run compose:logs
npm run compose:down
```

Notes:
- Traefik labels were removed from production compose; bring your own reverse proxy/load balancer.
- The prod compose includes optional services (redis, postgres, nginx, monitoring). Configure as needed.

## Troubleshooting
- 401 on /webhook: Ensure `TELEGRAM_WEBHOOK_SECRET` matches the secret you set via setWebhook.
- No messages sent: Confirm `TELEGRAM_BOT_TOKEN` is valid and not revoked.
- CORS blocked in browser: Set `ALLOWED_ORIGINS` to your domains.
- Healthcheck failing in Docker: Check logs and verify `/api/health` is reachable.

## License
MIT
