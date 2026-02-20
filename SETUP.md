# Kanban Board — Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Vercel account (free tier works)
- Accounts on Gmail, Slack, and Asana

---

## Step 1 — Install dependencies

```bash
cd kanban-app
npm install
cp .env.example .env.local
```

---

## Step 2 — Gmail (Google OAuth)

**2a. Create a Google Cloud project**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it `kanban-board` → Create
3. In the left sidebar: **APIs & Services → Library**
4. Search for **Gmail API** → Enable it

**2b. Create OAuth credentials**
1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Desktop app** (simplest for a personal tool)
3. Name: `kanban-board`
4. Copy the **Client ID** and **Client Secret** into `.env.local`

**2c. Get your refresh token (one-time)**
```bash
npm run get-gmail-token
```
Follow the prompts — it opens a URL, you authorize, paste the code back.
Copy the printed `GOOGLE_REFRESH_TOKEN=...` into `.env.local`.

> ℹ️ The refresh token never expires. You only run this script once.

---

## Step 3 — Slack

**3a. Create a Slack App**
1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App → From scratch**
2. Name: `Kanban Board`, pick your workspace

**3b. Add OAuth scopes**
In **OAuth & Permissions → Scopes → User Token Scopes**, add:
- `channels:history` — read channel message history
- `channels:read` — list channels
- `groups:history` — private channel history
- `groups:read` — list private channels
- `im:history` — direct message history
- `im:read` — list DMs
- `users:read` — look up user display names

**3c. Install the app**
1. Click **Install to Workspace** at the top of OAuth & Permissions
2. Authorize it
3. Copy the **User OAuth Token** (starts with `xoxp-`) into `.env.local` as `SLACK_TOKEN`

---

## Step 4 — Asana

1. Go to [app.asana.com/0/profile/apps](https://app.asana.com/0/profile/apps)
2. Click **+ New access token**
3. Name it `kanban-board`, confirm
4. Copy the token into `.env.local` as `ASANA_TOKEN`

> Optional: If you have multiple Asana workspaces and want to pin to one, run `node -e "require('./lib/asana.js').fetchAsanaItems().then(i=>console.log(i))"` after setup to see the workspace GID, and set `ASANA_WORKSPACE_GID`.

---

## Step 5 — Anthropic API key (for AI prioritization)

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
2. Add it to `.env.local` as `ANTHROPIC_API_KEY`

> If you skip this, the app still works using a keyword-based heuristic fallback.

---

## Step 6 — Run locally

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). You should see live data loading.

---

## Step 7 — Deploy to Vercel

**7a. Push to GitHub**
```bash
git init && git add . && git commit -m "init kanban board"
gh repo create kanban-board --private --push
```

**7b. Import on Vercel**
1. Go to [vercel.com/new](https://vercel.com/new) → Import your `kanban-board` repo
2. Framework preset: **Next.js** (auto-detected)
3. Click **Environment Variables** and add every key from `.env.local`
4. Click **Deploy**

That's it — your board is live at `https://your-project.vercel.app`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Gmail shows 0 emails | Check the OAuth consent screen has `gmail.readonly` scope; re-run `get-gmail-token` |
| Slack shows no items | Make sure all 6 scopes are added **before** installing the app to workspace |
| Asana returns 401 | Token may be expired — generate a new PAT |
| AI prioritization not working | Check `ANTHROPIC_API_KEY` is set; heuristic fallback activates automatically |
| Vercel build fails | Make sure all env vars are set in Vercel dashboard, not just `.env.local` |

---

## Auto-refresh

The board automatically re-fetches every 5 minutes. You can also hit the **⟳ Sync** button manually.

---

## File overview

```
kanban-app/
├── pages/
│   ├── index.jsx          ← Kanban UI (light/dark, live data)
│   └── api/items.js       ← Fetches + AI-prioritizes all sources
├── lib/
│   ├── gmail.js           ← Gmail API fetcher
│   ├── slack.js           ← Slack API fetcher
│   ├── asana.js           ← Asana API fetcher
│   ├── prioritize.js      ← Claude Haiku prioritization
│   └── utils.js           ← Date helpers
├── scripts/
│   └── get-gmail-token.js ← One-time Gmail OAuth token getter
├── .env.example           ← Template — copy to .env.local
└── SETUP.md               ← This file
```
