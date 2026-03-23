import { useState, useEffect } from 'react'

export interface ProjectWork {
  folder: string
  commits: number
  summary: string
}

export interface RecentWork {
  projects: ProjectWork[]
}

export function useRecentWork() {
  const [data, setData] = useState<RecentWork | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/recent-work.json')
      .then(r => r.json())
      .then(d => setData({
        projects: d.projects || [],
      }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}
