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
