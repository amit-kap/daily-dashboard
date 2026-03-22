import { useState, useEffect } from 'react'

export interface RecentWork {
  sessionCount: number
  sessionNames: string[]
  summary: string
}

export function useRecentWork() {
  const [data, setData] = useState<RecentWork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/recent-work.json')
      .then(r => r.json())
      .then(d => setData({
        sessionCount: d.sessionCount || 0,
        sessionNames: d.sessionNames || [],
        summary: d.summary || '',
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
