# Daily Dashboard — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal morning dashboard PWA with a Linear widget showing cycle tasks, filterable by status, with actions to open in Linear or Claude Code.

**Architecture:** React + Vite + Tailwind single-page app. Linear data fetched via `@linear/sdk`. Widget-based layout designed for future expansion (Calendar, Gmail, LinkedIn). PWA-installable via Vite PWA plugin.

**Tech Stack:** React 18, Vite, Tailwind CSS, TypeScript, `@linear/sdk`, `vite-plugin-pwa`

**Spec:** `docs/superpowers/specs/2026-03-18-daily-dashboard-design.md`

---

## Chunk 1: Project Scaffold & Theming

### Task 1: Initialize Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `public/icon-192.png` (placeholder)
- Create: `public/icon-512.png` (placeholder)
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/amitka/Development/daily-dashboard
npm create vite@latest . -- --template react-ts
```

Select "React" and "TypeScript" if prompted. If the directory isn't empty, confirm overwrite.

- [ ] **Step 2: Install dependencies**

```bash
npm install @linear/sdk
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa
```

- [ ] **Step 3: Configure Tailwind in vite.config.ts**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Daily Dashboard',
        short_name: 'Dashboard',
        description: 'Personal morning dashboard',
        theme_color: '#09090b',
        background_color: '#09090b',
        display: 'standalone',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Set up Tailwind in src/index.css**

Replace `src/index.css` with:

```css
@import "tailwindcss";

@layer utilities {
  .scrollbar-none {
    scrollbar-width: none;
  }
  .scrollbar-none::-webkit-scrollbar {
    display: none;
  }
}
```

- [ ] **Step 5: Create .env.example and .gitignore entry**

Create `.env.example`:
```
VITE_LINEAR_API_KEY=
```

Ensure `.gitignore` includes:
```
.env
.env.local
```

- [ ] **Step 6: Create placeholder PWA icons**

```bash
mkdir -p public
# Create minimal 1x1 PNG placeholders (will be replaced with real icons later)
convert -size 192x192 xc:'#09090b' public/icon-192.png 2>/dev/null || touch public/icon-192.png
convert -size 512x512 xc:'#09090b' public/icon-512.png 2>/dev/null || touch public/icon-512.png
```

- [ ] **Step 7: Create minimal App.tsx**

Replace `src/App.tsx` with:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-200 p-6">
      <h1 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
        Daily Dashboard
      </h1>
    </div>
  )
}
```

- [ ] **Step 8: Update main.tsx**

Replace `src/main.tsx` with:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Verify it runs**

```bash
npm run dev
```

Expected: App loads at `http://localhost:5173` showing "DAILY DASHBOARD" text. Background should match system theme (white in light, near-black in dark).

- [ ] **Step 10: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Vite + React + Tailwind project with PWA config"
```

---

### Task 2: Linear client & types

**Files:**
- Create: `src/lib/linear-client.ts`
- Create: `src/types/linear.ts`

- [ ] **Step 1: Create Linear client**

Create `src/lib/linear-client.ts`:

```ts
import { LinearClient } from '@linear/sdk'

const apiKey = import.meta.env.VITE_LINEAR_API_KEY

export const linearClient = apiKey ? new LinearClient({ apiKey }) : null
```

- [ ] **Step 2: Create types**

Create `src/types/linear.ts`:

```ts
export interface DashboardIssue {
  id: string
  identifier: string
  title: string
  url: string
  priority: number // 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low
  state: {
    id: string
    name: string
    type: string // 'unstarted' | 'started' | 'completed' | 'cancelled' | 'backlog' | 'triage'
  }
  labels: { id: string; name: string }[]
  project: { id: string; name: string } | null
}

export interface DashboardCycle {
  id: string
  number: number
  startsAt: string
  endsAt: string
}

export type StatusCategory = 'todo' | 'inProgress' | 'inReview' | 'deployed'

export const STATUS_CONFIG: Record<StatusCategory, { label: string; dot: string }> = {
  todo: { label: 'Todo', dot: '#a1a1aa' },
  inProgress: { label: 'In Progress', dot: '#3b82f6' },
  inReview: { label: 'In Review', dot: '#a78bfa' },
  deployed: { label: 'Deployed', dot: '#22c55e' },
}

export const PRIORITY_COLORS: Record<number, string> = {
  1: '#ef4444', // Urgent
  2: '#f97316', // High
  3: '#eab308', // Medium
  4: '#a1a1aa', // Low
}

export function categorizeState(state: { type: string; name: string }): StatusCategory {
  switch (state.type) {
    case 'unstarted':
      return 'todo'
    case 'started':
      return state.name.toLowerCase().includes('review') ? 'inReview' : 'inProgress'
    case 'completed':
      return 'deployed'
    default:
      return 'todo'
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/linear-client.ts src/types/linear.ts
git commit -m "feat: add Linear client and dashboard types with status mapping"
```

---

## Chunk 2: Data Fetching Hook

### Task 3: useLinear hook

**Files:**
- Create: `src/hooks/useLinear.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useLinear.ts`:

```ts
import { useCallback, useEffect, useState } from 'react'
import { linearClient } from '../lib/linear-client'
import { categorizeState, type DashboardCycle, type DashboardIssue, type StatusCategory } from '../types/linear'

interface UseLinearResult {
  issues: Record<StatusCategory, DashboardIssue[]>
  cycle: DashboardCycle | null
  workflowStates: { id: string; name: string; type: string }[]
  loading: boolean
  error: string | null
  navigateCycle: (direction: 'prev' | 'next') => void
  updateIssueState: (issueId: string, stateId: string) => Promise<void>
  refresh: () => void
}

export function useLinear(): UseLinearResult {
  const [issues, setIssues] = useState<Record<StatusCategory, DashboardIssue[]>>({
    todo: [], inProgress: [], inReview: [], deployed: [],
  })
  const [cycle, setCycle] = useState<DashboardCycle | null>(null)
  const [workflowStates, setWorkflowStates] = useState<{ id: string; name: string; type: string }[]>([])
  const [cycleNumber, setCycleNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (targetCycleNumber?: number) => {
    if (!linearClient) {
      setError('Add your Linear API key in .env')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const viewer = await linearClient.viewer
      const teams = await viewer.teams()

      if (teams.nodes.length === 0) {
        setError('No teams found')
        setLoading(false)
        return
      }

      // Get states from all teams
      const allStates: { id: string; name: string; type: string }[] = []
      for (const team of teams.nodes) {
        const states = await team.states()
        allStates.push(...states.nodes.map(s => ({ id: s.id, name: s.name, type: s.type })))
      }
      setWorkflowStates(allStates)

      // Find the target cycle
      let targetCycle: DashboardCycle | null = null

      if (targetCycleNumber) {
        // Search across all teams for this cycle number
        for (const team of teams.nodes) {
          const cycles = await team.cycles({ filter: { number: { eq: targetCycleNumber } } })
          if (cycles.nodes.length > 0) {
            const c = cycles.nodes[0]
            targetCycle = { id: c.id, number: c.number, startsAt: c.startsAt, endsAt: c.endsAt }
            break
          }
        }
      } else {
        // Get active cycle from first team that has one
        for (const team of teams.nodes) {
          const activeCycle = await team.activeCycle
          if (activeCycle) {
            targetCycle = {
              id: activeCycle.id,
              number: activeCycle.number,
              startsAt: activeCycle.startsAt,
              endsAt: activeCycle.endsAt,
            }
            break
          }
        }
      }

      if (!targetCycle) {
        setCycle(null)
        setError('No active cycle')
        setLoading(false)
        return
      }

      setCycle(targetCycle)
      setCycleNumber(targetCycle.number)

      // Fetch issues for this cycle assigned to viewer
      const cycleRef = await linearClient.cycle(targetCycle.id)
      const cycleIssues = await cycleRef.issues({
        filter: { assignee: { id: { eq: viewer.id } } },
      })

      // Group by status category
      const grouped: Record<StatusCategory, DashboardIssue[]> = {
        todo: [], inProgress: [], inReview: [], deployed: [],
      }

      for (const issue of cycleIssues.nodes) {
        const state = await issue.state
        if (!state) continue

        const category = categorizeState({ type: state.type, name: state.name })
        const labelsConn = await issue.labels()
        const projectRef = await issue.project

        grouped[category].push({
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          url: issue.url,
          priority: issue.priority,
          state: { id: state.id, name: state.name, type: state.type },
          labels: labelsConn.nodes.map(l => ({ id: l.id, name: l.name })),
          project: projectRef ? { id: projectRef.id, name: projectRef.name } : null,
        })
      }

      // Sort each category by priority (1=urgent first)
      for (const key of Object.keys(grouped) as StatusCategory[]) {
        grouped[key].sort((a, b) => {
          const pa = a.priority || 5
          const pb = b.priority || 5
          return pa - pb
        })
      }

      setIssues(grouped)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch data'
      if (message.includes('authentication') || message.includes('401')) {
        setError('Invalid API key')
      } else {
        setError("Couldn't reach Linear")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const navigateCycle = useCallback((direction: 'prev' | 'next') => {
    if (!cycleNumber) return
    const target = direction === 'prev' ? cycleNumber - 1 : cycleNumber + 1
    fetchData(target)
  }, [cycleNumber, fetchData])

  const updateIssueState = useCallback(async (issueId: string, stateId: string) => {
    if (!linearClient) return

    // Optimistic update
    setIssues(prev => {
      const updated = { ...prev }
      let movedIssue: DashboardIssue | null = null

      // Remove from current category
      for (const key of Object.keys(updated) as StatusCategory[]) {
        const idx = updated[key].findIndex(i => i.id === issueId)
        if (idx !== -1) {
          movedIssue = { ...updated[key][idx] }
          updated[key] = updated[key].filter((_, i) => i !== idx)
          break
        }
      }

      if (movedIssue) {
        const newState = workflowStates.find(s => s.id === stateId)
        if (newState) {
          movedIssue.state = { id: newState.id, name: newState.name, type: newState.type }
          const newCategory = categorizeState(newState)
          updated[newCategory] = [...updated[newCategory], movedIssue]
        }
      }

      return updated
    })

    // API call
    await linearClient.issueUpdate(issueId, { stateId })
  }, [workflowStates])

  const refresh = useCallback(() => {
    fetchData(cycleNumber ?? undefined)
  }, [fetchData, cycleNumber])

  return { issues, cycle, workflowStates, loading, error, navigateCycle, updateIssueState, refresh }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useLinear.ts
git commit -m "feat: add useLinear hook with cycle navigation and status updates"
```

---

## Chunk 3: Widget Components

### Task 4: CycleNav component

**Files:**
- Create: `src/widgets/linear/CycleNav.tsx`

- [ ] **Step 1: Create CycleNav**

Create `src/widgets/linear/CycleNav.tsx`:

```tsx
import type { DashboardCycle } from '../../types/linear'

interface CycleNavProps {
  cycle: DashboardCycle | null
  onNavigate: (direction: 'prev' | 'next') => void
}

function formatCycleTooltip(cycle: DashboardCycle): string {
  const start = new Date(cycle.startsAt)
  const end = new Date(cycle.endsAt)
  const now = new Date()
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const daysFromStart = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const daysToEnd = Math.floor((end.getTime() - now.getTime()) / 86400000)

  let timing = ''
  if (daysToEnd < 0) {
    timing = `ended ${Math.abs(daysToEnd)} days ago`
  } else if (daysToEnd === 0) {
    timing = `started ${daysFromStart} days ago, ends today`
  } else {
    timing = `started ${daysFromStart} days ago, ${daysToEnd} days remaining`
  }

  return `${fmt(start)} – ${fmt(end)} (${timing})`
}

export default function CycleNav({ cycle, onNavigate }: CycleNavProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onNavigate('prev')}
        title="Previous cycle"
        className="text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 px-1 py-0.5 rounded"
      >
        &larr;
      </button>
      <span
        className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500"
        title={cycle ? formatCycleTooltip(cycle) : undefined}
      >
        {cycle ? `Cycle ${cycle.number}` : '—'}
      </span>
      <button
        onClick={() => onNavigate('next')}
        title="Next cycle"
        className="text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 px-1 py-0.5 rounded"
      >
        &rarr;
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/linear/CycleNav.tsx
git commit -m "feat: add CycleNav component with date tooltip"
```

---

### Task 5: FilterTabs component

**Files:**
- Create: `src/widgets/linear/FilterTabs.tsx`

- [ ] **Step 1: Create FilterTabs**

Create `src/widgets/linear/FilterTabs.tsx`:

```tsx
import { STATUS_CONFIG, type StatusCategory } from '../../types/linear'

const TABS: StatusCategory[] = ['todo', 'inProgress', 'inReview', 'deployed']

interface FilterTabsProps {
  activeTab: StatusCategory
  counts: Record<StatusCategory, number>
  onTabChange: (tab: StatusCategory) => void
}

export default function FilterTabs({ activeTab, counts, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex border-b border-zinc-100 dark:border-zinc-800/60 px-3.5">
      {TABS.map(tab => {
        const config = STATUS_CONFIG[tab]
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={config.label}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-zinc-900 dark:border-zinc-200 text-zinc-900 dark:text-zinc-200'
                : 'border-transparent text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400'
            }`}
          >
            <span
              className={`w-[5px] h-[5px] rounded-full ${isActive ? 'opacity-100' : 'opacity-40'}`}
              style={{ backgroundColor: config.dot }}
            />
            {isActive && <span>{config.label}</span>}
            <span>{counts[tab]}</span>
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/linear/FilterTabs.tsx
git commit -m "feat: add FilterTabs with active label and dot indicators"
```

---

### Task 6: TaskCard component

**Files:**
- Create: `src/widgets/linear/TaskCard.tsx`

- [ ] **Step 1: Create TaskCard**

Create `src/widgets/linear/TaskCard.tsx`:

```tsx
import { useState } from 'react'
import { PRIORITY_COLORS, type DashboardIssue } from '../../types/linear'

interface TaskCardProps {
  issue: DashboardIssue
  deployed?: boolean
  onClick: () => void
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TaskCard({ issue, deployed, onClick }: TaskCardProps) {
  const priorityColor = PRIORITY_COLORS[issue.priority]

  const handleLinear = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(issue.url, '_blank')
  }

  const [copied, setCopied] = useState(false)

  const handleClaude = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`claude "Work on: ${issue.identifier} - ${issue.title}"`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 px-3 mb-1 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${
        deployed ? 'opacity-40 hover:opacity-60' : ''
      }`}
    >
      {/* Top row: priority dot + ID + action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
          {priorityColor && (
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: priorityColor }} />
          )}
          {issue.identifier}
        </div>
        {!deployed && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleLinear}
              title="Open in Linear"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <ExternalLinkIcon />
            </button>
            <button
              onClick={handleClaude}
              title="Open in Claude"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 dark:text-zinc-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative"
            >
              {copied ? <span className="text-[8px] text-green-500">Copied!</span> : <LayersIcon />}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-[1.4] line-clamp-2">
        {issue.title}
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {issue.labels.map(label => (
            <span
              key={label.id}
              className="text-[9px] font-medium px-1.5 py-px rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/linear/TaskCard.tsx
git commit -m "feat: add TaskCard with priority dot, labels, and hover actions"
```

---

### Task 7: TaskDrawer component

**Files:**
- Create: `src/widgets/linear/TaskDrawer.tsx`

- [ ] **Step 1: Create TaskDrawer**

Create `src/widgets/linear/TaskDrawer.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { PRIORITY_COLORS, categorizeState, type DashboardIssue, type StatusCategory } from '../../types/linear'

interface TaskDrawerProps {
  issue: DashboardIssue | null
  workflowStates: { id: string; name: string; type: string }[]
  onClose: () => void
  onStatusChange: (issueId: string, stateId: string) => void
}

const PRIORITY_LABELS: Record<number, string> = {
  0: 'None', 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low',
}

export default function TaskDrawer({ issue, workflowStates, onClose, onStatusChange }: TaskDrawerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!issue) return null

  const priorityColor = PRIORITY_COLORS[issue.priority]

  const [copied, setCopied] = useState(false)

  const handleClaude = () => {
    navigator.clipboard.writeText(`claude "Work on: ${issue.identifier} - ${issue.title}"`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-sm transition-opacity ${issue ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[51] w-[340px] max-w-[85vw] h-screen bg-zinc-50 dark:bg-zinc-900/95 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ${
          issue ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
          <div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mb-1">{issue.identifier}</div>
            <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-[1.4]">{issue.title}</div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 text-base px-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Project */}
          {issue.project && (
            <div className="mb-3.5">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Project</div>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-400">{issue.project.name}</div>
            </div>
          )}

          {/* Priority */}
          <div className="mb-3.5">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Priority</div>
            <span
              className="text-[11px] px-2 py-0.5 rounded"
              style={{
                color: priorityColor || '#a1a1aa',
                backgroundColor: priorityColor ? `${priorityColor}1a` : '#a1a1aa1a',
              }}
            >
              {PRIORITY_LABELS[issue.priority] || 'None'}
            </span>
          </div>

          {/* Status + change */}
          <div className="mb-3.5">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Status</div>
            <select
              value={issue.state.id}
              onChange={(e) => onStatusChange(issue.id, e.target.value)}
              className="text-[13px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 cursor-pointer"
            >
              {workflowStates.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
          <button
            onClick={() => window.open(issue.url, '_blank')}
            className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Linear
          </button>
          <button
            onClick={handleClaude}
            className="flex-1 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {copied ? 'Copied!' : 'Claude'}
          </button>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/linear/TaskDrawer.tsx
git commit -m "feat: add TaskDrawer with status change, Linear and Claude actions"
```

---

## Chunk 4: Widget Assembly & Integration

### Task 8: LinearWidget container

**Files:**
- Create: `src/widgets/linear/LinearWidget.tsx`

- [ ] **Step 1: Create LinearWidget**

Create `src/widgets/linear/LinearWidget.tsx`:

```tsx
import { useState } from 'react'
import { useLinear } from '../../hooks/useLinear'
import { type DashboardIssue, type StatusCategory } from '../../types/linear'
import CycleNav from './CycleNav'
import FilterTabs from './FilterTabs'
import TaskCard from './TaskCard'
import TaskDrawer from './TaskDrawer'

export default function LinearWidget() {
  const { issues, cycle, workflowStates, loading, error, navigateCycle, updateIssueState, refresh } = useLinear()
  const [activeTab, setActiveTab] = useState<StatusCategory>('todo')
  const [selectedIssue, setSelectedIssue] = useState<DashboardIssue | null>(null)

  const counts: Record<StatusCategory, number> = {
    todo: issues.todo.length,
    inProgress: issues.inProgress.length,
    inReview: issues.inReview.length,
    deployed: issues.deployed.length,
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="w-80 h-[420px] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#09090b] flex flex-col">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Linear</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-2">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{error}</p>
          {error === "Couldn't reach Linear" && (
            <button onClick={refresh} className="text-[10px] text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200">
              Retry
            </button>
          )}
          {error === 'Invalid API key' && (
            <a href="https://linear.app/settings/api" target="_blank" rel="noopener" className="text-[10px] text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200">
              Linear Settings
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-[420px] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#09090b] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Linear</span>
        <CycleNav cycle={cycle} onNavigate={navigateCycle} />
      </div>

      {/* Filter tabs */}
      <FilterTabs activeTab={activeTab} counts={counts} onTabChange={setActiveTab} />

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Loading...</span>
          </div>
        ) : issues[activeTab].length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">No tasks</span>
          </div>
        ) : (
          issues[activeTab].map(issue => (
            <TaskCard
              key={issue.id}
              issue={issue}
              deployed={activeTab === 'deployed'}
              onClick={() => setSelectedIssue(issue)}
            />
          ))
        )}
      </div>

      {/* Drawer */}
      <TaskDrawer
        issue={selectedIssue}
        workflowStates={workflowStates}
        onClose={() => setSelectedIssue(null)}
        onStatusChange={(issueId, stateId) => {
          updateIssueState(issueId, stateId)
        }}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/linear/LinearWidget.tsx
git commit -m "feat: add LinearWidget container with tabs, cards, and drawer"
```

---

### Task 9: Integrate into App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update App.tsx**

Replace `src/App.tsx` with:

```tsx
import LinearWidget from './widgets/linear/LinearWidget'

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] p-6">
      <LinearWidget />
    </div>
  )
}
```

- [ ] **Step 2: Verify it runs**

```bash
npm run dev
```

Expected: App loads showing the Linear widget. If `VITE_LINEAR_API_KEY` is set in `.env`, it fetches real data. If not, shows "Add your Linear API key in .env" error message.

- [ ] **Step 3: Create .env with API key**

```bash
echo "VITE_LINEAR_API_KEY=your_key_here" > .env
```

Replace `your_key_here` with the actual Linear API key. Then restart the dev server.

- [ ] **Step 4: Verify with real data**

Reload the page. Expected: Widget shows real cycle data, tasks grouped by status, filter tabs with correct counts.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate LinearWidget into App shell"
```

---

### Task 10: Final build verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: Build succeeds, outputs to `dist/`.

- [ ] **Step 3: Preview production build**

```bash
npm run preview
```

Expected: App loads, widget functional, PWA installable.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify production build"
```
