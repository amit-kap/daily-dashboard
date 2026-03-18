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
            targetCycle = { id: c.id, number: c.number, startsAt: c.startsAt.toISOString(), endsAt: c.endsAt.toISOString() }
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
              startsAt: activeCycle.startsAt.toISOString(),
              endsAt: activeCycle.endsAt.toISOString(),
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
          description: issue.description ?? null,
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

    // API call — use raw GraphQL mutation
    await linearClient.client.rawRequest(
      `mutation IssueUpdate($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }`,
      { id: issueId, input: { stateId } }
    )
  }, [workflowStates])

  const refresh = useCallback(() => {
    fetchData(cycleNumber ?? undefined)
  }, [fetchData, cycleNumber])

  return { issues, cycle, workflowStates, loading, error, navigateCycle, updateIssueState, refresh }
}
