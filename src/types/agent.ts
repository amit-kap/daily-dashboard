export interface SlackMessage {
  author: string
  text: string
  ts: string
}

export interface NotionPage {
  title: string
  url: string
  excerpt: string
}

export interface FirefliesMeeting {
  title: string
  date: string
  actionItems: string[]
  keywords: string[]
}

export interface LinearComment {
  author: string
  text: string
  date: string
}

export interface LinkedIssue {
  identifier: string
  title: string
  stateName?: string
  relation?: string
}

export interface LinearAttachment {
  title: string
  url: string
}

export interface Recommendation {
  rank: number
  score: number
  identifier: string
  title: string
  url: string
  priority: number
  projectName: string | null
  stateName: string
  reasoning: string

  linear: {
    description: string | null
    assignee: string | null
    estimate: number | null
    dueDate: string | null
    createdAt: string | null
    updatedAt: string | null
    labels: string[]
    projectName: string | null
    cycleName: string | null
    cycleEndsAt: string | null
    comments: LinearComment[]
    blockedIssues: LinkedIssue[]
    blockingIssues: LinkedIssue[]
    relatedIssues: LinkedIssue[]
    subIssues: LinkedIssue[]
    parentIssue: LinkedIssue | null
    attachments: LinearAttachment[]
  }
  slack: {
    channelName: string
    messages: SlackMessage[]
  } | null
  notion: {
    pages: NotionPage[]
  } | null
  fireflies: {
    meetings: FirefliesMeeting[]
  } | null

  sources: SourceType[]
}

export type SourceType = 'linear' | 'slack' | 'notion' | 'fireflies'

export interface AgentOutput {
  generatedAt: string
  cycleEndsAt: string | null
  recommendations: Recommendation[]
  summary: string
}

export const PRIORITY_COLORS: Record<number, string> = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#a1a1aa',
}

export const PRIORITY_LABELS: Record<number, string> = {
  0: 'None', 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low',
}

export const SOURCE_COLORS: Record<SourceType, string> = {
  linear: '#5e6ad2',
  slack: '#3b82f6',
  notion: '#a1a1aa',
  fireflies: '#ec4899',
}
