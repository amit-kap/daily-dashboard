import { useCallback, useEffect, useState } from 'react'

export interface SlackItem {
  id: string
  channel: string
  author: string
  text: string
  ts: string
  mention: boolean
}

export interface SlackCategory {
  name: string
  items: SlackItem[]
}

interface SlackData {
  generatedAt: string
  categories: SlackCategory[]
}

const STORAGE_KEY = 'slack-dismissed'

function getDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useSlack() {
  const [data, setData] = useState<SlackData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(getDismissed)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/slack.json')
      if (!res.ok) throw new Error('No slack data')
      const json: SlackData = await res.json()
      setData(json)
      // Clear dismissed IDs that no longer exist in data
      const allIds = new Set(json.categories.flatMap(c => c.items.map(i => i.id)))
      const cleaned = new Set([...getDismissed()].filter(id => allIds.has(id)))
      saveDismissed(cleaned)
      setDismissed(cleaned)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const dismiss = useCallback((id: string) => {
    setDismissed(prev => {
      const next = new Set(prev)
      next.add(id)
      saveDismissed(next)
      return next
    })
  }, [])

  // Filter out dismissed items
  const categories: SlackCategory[] = (data?.categories ?? [])
    .map(c => ({
      ...c,
      items: c.items.filter(i => !dismissed.has(i.id)),
    }))
    .filter(c => c.items.length > 0)

  return { categories, generatedAt: data?.generatedAt ?? null, loading, dismiss }
}
