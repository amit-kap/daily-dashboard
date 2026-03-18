# Daily Dashboard — Design Spec

## Overview

A personal morning dashboard PWA that aggregates data from Linear, Google Calendar, Gmail, and LinkedIn into a single web page. Installable as a Chrome app for a native-like experience. Syncs with system light/dark theme.

**V1 scope: Linear widget only.** Other sections (Calendar, Gmail, LinkedIn) will be added incrementally.

## Tech Stack

- **React + Vite** — component-based, HMR during dev, tiny production build
- **Tailwind CSS** — utility-first, responsive, minimal custom CSS
- **Vite PWA plugin** — enables Chrome "Install as app" with manifest + service worker
- **`@linear/sdk`** — official Linear SDK for TypeScript (wraps GraphQL API)

## Authentication

- Linear API key stored in `.env` as `VITE_LINEAR_API_KEY`
- `.env` is gitignored
- The `@linear/sdk` client is initialized with this key
- Personal API key generated at Linear Settings → API → Personal API keys

## Architecture

```
daily-dashboard/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env                       # VITE_LINEAR_API_KEY (gitignored)
├── .env.example               # Template with empty key
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── main.tsx
│   ├── App.tsx                # Dashboard layout, widget grid
│   ├── hooks/
│   │   └── useLinear.ts       # Linear API data fetching
│   ├── widgets/
│   │   └── linear/
│   │       ├── LinearWidget.tsx      # Widget container
│   │       ├── FilterTabs.tsx        # Status filter tabs
│   │       ├── TaskCard.tsx          # Individual task card
│   │       ├── TaskDrawer.tsx        # Side drawer for task details
│   │       └── CycleNav.tsx          # Cycle navigation
│   ├── lib/
│   │   └── linear-client.ts  # Linear SDK client instance
│   └── types/
│       └── linear.ts          # TypeScript types for Linear data
└── docs/
```

## Linear Widget — Detailed Design

### Layout

The Linear widget is a **narrow vertical panel** (320px in the full dashboard grid) with fixed height (420px) and internal scroll. It is one of several widgets that will sit side-by-side in the dashboard.

### Structure (top to bottom)

1. **Widget header** — "LINEAR" label (left) + cycle navigation (right)
2. **Filter tabs** — Horizontal tabs for status filtering
3. **Card list** — Scrollable list of task cards for the active status

### Widget Header

- Left: "LINEAR" — 11px, uppercase, muted color, letter-spacing
- Right: Cycle navigation
  - `←` button (tooltip: "Previous cycle")
  - Cycle title: "Cycle {number}" (10px, muted)
    - **Tooltip on hover**: Shows cycle date range with relative timing
    - Format: `"Mar 4 – Mar 18 (started X days ago, Y days remaining)"`
    - Computed from cycle `startsAt` and `endsAt` via Linear API
  - `→` button (tooltip: "Next cycle")

### Filter Tabs

- Tabs are derived from Linear's **workflow state categories** (not custom state names):
  - `unstarted` → **Todo** (dot: gray `#a1a1aa`)
  - `started` → **In Progress** (dot: blue `#3b82f6`)
  - `started` with "review" states → **In Review** (dot: purple `#a78bfa`)
  - `completed` → **Deployed** (dot: green `#22c55e`)
- Mapping logic: Group issues by `state.type`. States with `type: "started"` whose name contains "review" (case-insensitive) go to "In Review"; other `started` states go to "In Progress".
- Tab content: colored status dot + count number
- **Active tab only** also shows the status label text (e.g., "Todo 3")
- Inactive tabs: just dot + count (e.g., "● 2")
- All tabs have `title` tooltip with full status name
- Clicking a tab shows/hides corresponding panel (simple show/hide, no animation)
- Default active tab: **Todo**
- Status order: Todo → In Progress → In Review → Deployed

### Task Card

Vertical layout, content-hugging (no fixed height). Consistent 4px vertical gap between elements.

**Structure (top to bottom):**

1. **Top row** (flex, space-between):
   - Left: Priority color dot (4px) + Task ID (monospace, 10px, muted)
   - Right: Action icon buttons (visible on hover only)
     - Open in Linear (external link icon, tooltip: "Open in Linear")
     - Open in Claude (layers icon, tooltip: "Open in Claude")
2. **Title** — 12px, medium weight, up to 2 lines with ellipsis overflow
3. **Labels** — Linear issue labels rendered as small chips (9px, surface background)
   - Only shown if the task has labels

**Priority color mapping:**

| Priority | Color | Dot |
|----------|-------|-----|
| Urgent (1) | `#ef4444` | Red |
| High (2) | `#f97316` | Orange |
| Medium (3) | `#eab308` | Yellow |
| Low (4) | `#a1a1aa` | Gray |
| None (0) | hidden | No dot |

**Deployed cards:** Reduced opacity (0.4), no action buttons.

**Interactions:**
- Hover: Background lightens, action icons appear
- Click: Opens side drawer with full task details

### Task Drawer

Slides in from the right (340px wide, max 85vw). Overlay with backdrop blur.

**Structure:**
- **Header**: Task ID (monospace) + Title (15px, bold) + close button (tooltip: "Close")
- **Body** (scrollable):
  - Project name
  - Priority (colored badge)
  - Status
  - Status change: dropdown to move task between statuses (calls Linear API `issueUpdate`)
  - *(Extensible: description, assignee, dates, etc.)*
- **Footer actions**:
  - "Linear" button — opens task in Linear browser
  - "Claude" button (primary) — copies CLI command to clipboard and shows confirmation

**Dismiss:** Click overlay, press Escape, or click close button.

### Actions

| Action | Behavior |
|--------|----------|
| Open in Linear | `window.open(task.url, '_blank')` — task URL comes from Linear API |
| Open in Claude | Copies `claude "Work on: {task.identifier} - {task.title}"` to clipboard. Shows a brief "Copied!" toast. User pastes in terminal. |
| Change status | Drawer shows a dropdown with available statuses. On select, calls `linearClient.issueUpdate(issueId, { stateId })`. Optimistic UI update, refetch on success. |

### Data Fetching

**Source:** Linear GraphQL API via `@linear/sdk`

**Client setup:**
```ts
import { LinearClient } from '@linear/sdk';
const linearClient = new LinearClient({ apiKey: import.meta.env.VITE_LINEAR_API_KEY });
```

**Queries needed:**
1. **Current user** — `linearClient.viewer` → `{ id, name }`
2. **User's teams** — `viewer.teams()` → get team IDs
3. **Active cycle** — `team.activeCycle` → `{ id, number, startsAt, endsAt }`
4. **Cycle issues** — `cycle.issues({ filter: { assignee: { id: { eq: viewerId } } } })` → issues with state, priority, labels, project
5. **Team workflow states** — `team.states()` → for status mapping and change status dropdown
6. **Adjacent cycles** — `team.cycles({ filter: { number: { eq: N } } })` for prev/next

**Refresh strategy:**
- On page load
- On cycle navigation
- On status change (optimistic update + refetch)

### Empty & Error States

| State | Display |
|-------|---------|
| No API key | Widget shows "Add your Linear API key in .env" with setup instructions link |
| Network error | Widget shows "Couldn't reach Linear" with a retry button |
| No cycles | Widget shows "No active cycle" |
| Empty status tab | Panel shows "No tasks" (centered, muted text) |
| API key invalid | Widget shows "Invalid API key" with link to Linear settings |

### Theming

Uses CSS custom properties with `prefers-color-scheme` media query:

- **Light mode**: White backgrounds, dark text, subtle borders
- **Dark mode**: Near-black backgrounds, light text, dim borders
- Automatically syncs with macOS system appearance
- All colors defined as CSS variables in `:root` and `@media (prefers-color-scheme: dark)` override

### Responsive Behavior

- Widget has a fixed width (320px) within the dashboard grid
- Widget has a fixed height (420px) with scrollable card list
- On narrow viewports, widgets stack vertically (full width)
- Drawer adapts to viewport (max 85vw)

## Future Sections (not in v1)

These will follow the same widget pattern:

- **Calendar widget** — Today's meetings from Google Calendar
- **Gmail widget** — Unread emails
- **LinkedIn widget** — Interesting posts/comments

## PWA Configuration

- `manifest.json` with app name, icons, theme colors
- Service worker for offline shell (Vite PWA plugin)
- `display: "standalone"` for native-like Chrome app window
- Launch at login via macOS Login Items (manual user setup)
