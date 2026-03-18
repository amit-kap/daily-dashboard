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

const ISSUES_QUERY = `
  query MyIssues {
    viewer {
      id
      assignedIssues(
        filter: { state: { type: { nin: ["cancelled"] } } }
        first: 100
        orderBy: updatedAt
      ) {
        nodes {
          id
          identifier
          title
          url
          description
          priority
          state { id name type }
          labels { nodes { id name } }
          project { id name }
        }
      }
      teams {
        nodes {
          id
          activeCycle { id number startsAt endsAt }
          states { nodes { id name type } }
        }
      }
    }
  }
`

interface GqlResponse {
  data: {
    viewer: {
      id: string
      assignedIssues: {
        nodes: {
          id: string
          identifier: string
          title: string
          url: string
          description: string | null
          priority: number
          state: { id: string; name: string; type: string }
          labels: { nodes: { id: string; name: string }[] }
          project: { id: string; name: string } | null
        }[]
      }
      teams: {
        nodes: {
          id: string
          activeCycle: { id: string; number: number; startsAt: string; endsAt: string } | null
          states: { nodes: { id: string; name: string; type: string }[] }
        }[]
      }
    }
  }
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

  const fetchData = useCallback(async () => {
    if (!linearClient) {
      setError('Add your Linear API key in .env')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await linearClient.client.rawRequest(ISSUES_QUERY, {}) as GqlResponse
      const viewer = response.data.viewer

      // Collect workflow states from all teams
      const allStates: { id: string; name: string; type: string }[] = []
      for (const team of viewer.teams.nodes) {
        allStates.push(...team.states.nodes)
      }
      setWorkflowStates(allStates)

      // Get active cycle from first team that has one
      for (const team of viewer.teams.nodes) {
        if (team.activeCycle) {
          setCycle({
            id: team.activeCycle.id,
            number: team.activeCycle.number,
            startsAt: team.activeCycle.startsAt,
            endsAt: team.activeCycle.endsAt,
          })
          setCycleNumber(team.activeCycle.number)
          break
        }
      }

      // Group issues by status category
      const grouped: Record<StatusCategory, DashboardIssue[]> = {
        todo: [], inProgress: [], inReview: [], deployed: [],
      }

      for (const issue of viewer.assignedIssues.nodes) {
        if (!issue.state) continue
        const category = categorizeState(issue.state)
        grouped[category].push({
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          url: issue.url,
          description: issue.description,
          priority: issue.priority,
          state: issue.state,
          labels: issue.labels.nodes,
          project: issue.project,
        })
      }

      // Sort by priority (1=urgent first)
      for (const key of Object.keys(grouped) as StatusCategory[]) {
        grouped[key].sort((a, b) => (a.priority || 5) - (b.priority || 5))
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
    setCycleNumber(prev => prev ? (direction === 'prev' ? prev - 1 : prev + 1) : prev)
  }, [cycleNumber])

  const updateIssueState = useCallback(async (issueId: string, stateId: string) => {
    if (!linearClient) return

    setIssues(prev => {
      const updated = { ...prev }
      let movedIssue: DashboardIssue | null = null

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

    await linearClient.client.rawRequest(
      `mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }`,
      { id: issueId, input: { stateId } }
    )
  }, [workflowStates])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { issues, cycle, workflowStates, loading, error, navigateCycle, updateIssueState, refresh }
}
