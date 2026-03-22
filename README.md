# Daily Dashboard

Personal morning dashboard PWA that aggregates work context from multiple sources into a single view.

## What it does

A scheduled Claude Code agent runs at 9 AM (Sun–Thu) and gathers data from 6 sources via MCP tools:

- **Linear** — assigned issues, cycle progress, comments, relations
- **Slack** — mentions, project channel activity
- **Notion** — related PRDs and docs
- **Fireflies** — meeting action items and keywords
- **Google Calendar** — today's events with smart insights
- **Gmail** — unread emails

The agent cross-references everything, scores and ranks tasks, then writes JSON files to `public/data/`. The dashboard reads those files — no browser-side API calls.

## Widgets

| Widget | Description |
|--------|-------------|
| **My Tasks** | Ranked task list with agent reasoning, source icons, and a detail drawer |
| **Linear Cycle** | Current cycle progress bar, status counters (To Do / Progress / Review / Done) |
| **Calendar** | Today's meetings with time, attendees, duration, and agent-generated insights |
| **Gmail** | Unread mail with Yesterday / All toggle |
| **Recent Work** | Summary of Claude Code sessions from the last 2 days |

## Stack

- React 19 + Vite 8 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn/ui with `@base-ui/react` primitives
- DM Sans + DM Mono fonts
- PWA via `vite-plugin-pwa`

## Data flow

```
Scheduled task (9 AM)
  → Claude Code with MCP tools
  → Queries Linear, Slack, Notion, Fireflies, Calendar, Gmail
  → Writes 4 JSON files to public/data/
  → Dashboard reads JSON at runtime
```

## Setup

```bash
npm install
npm run dev
```

Data files in `public/data/` are gitignored (contain personal data). The dashboard shows empty states until the agent runs.

## Project structure

```
src/
  widgets/          — 5 widget components
  hooks/            — data fetching hooks (read JSON)
  components/ui/    — shadcn/ui primitives
  types/            — TypeScript types
scripts/
  dashboard-agent-prompt.md  — full agent prompt for data gathering
public/data/
  recommendations.json       — ranked tasks (gitignored)
  calendar.json              — today's events (gitignored)
  gmail.json                 — unread emails (gitignored)
  recent-work.json           — session summaries (gitignored)
```
