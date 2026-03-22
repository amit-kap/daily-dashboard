import { useCallback, useEffect, useState } from 'react'

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  attendees?: string[]
  insight?: string
}

interface CalendarData {
  generatedAt: string
  events: CalendarEvent[]
}

export function useCalendar() {
  const [data, setData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/data/calendar.json')
      if (!res.ok) throw new Error('No calendar data')
      setData(await res.json())
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  return { events: data?.events ?? [], loading }
}
