import { useCallback, useEffect, useState } from 'react'
import type { AgentOutput, Recommendation } from '../types/agent'

interface UseRecommendationsResult {
  recommendations: Recommendation[]
  summary: string | null
  generatedAt: string | null
  cycleEndsAt: string | null
  loading: boolean
  error: string | null
  stale: boolean
  refresh: () => void
}

const STALE_THRESHOLD_MS = 8 * 60 * 60 * 1000 // 8 hours

export function useRecommendations(): UseRecommendationsResult {
  const [data, setData] = useState<AgentOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/data/recommendations.json')
      if (!res.ok) throw new Error('No recommendations found')
      const json: AgentOutput = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stale = data
    ? Date.now() - new Date(data.generatedAt).getTime() > STALE_THRESHOLD_MS
    : false

  return {
    recommendations: data?.recommendations ?? [],
    summary: data?.summary ?? null,
    generatedAt: data?.generatedAt ?? null,
    cycleEndsAt: data?.cycleEndsAt ?? null,
    loading,
    error,
    stale,
    refresh: fetchData,
  }
}
