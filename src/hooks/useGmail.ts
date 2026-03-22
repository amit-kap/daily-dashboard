import { useCallback, useEffect, useState } from 'react'

export interface Email {
  id: string
  from: string
  subject: string
  snippet: string
  ts: string
  starred: boolean
}

interface GmailData {
  generatedAt: string
  unreadCount: number
  emails: Email[]
  recentEmails: Email[]
}

export function useGmail() {
  const [data, setData] = useState<GmailData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/gmail.json')
      if (!res.ok) throw new Error('No gmail data')
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return {
    emails: data?.emails ?? [],
    recentEmails: data?.recentEmails ?? [],
    unreadCount: data?.unreadCount ?? 0,
    loading,
  }
}
