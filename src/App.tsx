import { useState, useEffect } from 'react'
import TodoAgentWidget from '@/widgets/agent/TodoAgentWidget'
import LinearCycleWidget from '@/widgets/linear/LinearCycleWidget'
import CalendarWidget from '@/widgets/calendar/CalendarWidget'
import GmailWidget from '@/widgets/gmail/GmailWidget'
import RecentWorkWidget from '@/widgets/recent-work/RecentWorkWidget'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5) return 'Good Night'
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function getTime() {
  return new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function App() {
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const [time, setTime] = useState(getTime)

  // Update clock every minute
  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), 60000)
    return () => clearInterval(id)
  }, [])

  // Read generatedAt from data on mount
  useEffect(() => {
    fetch('/data/recommendations.json')
      .then(r => r.json())
      .then(d => { if (d.generatedAt) setLastRefresh(d.generatedAt) })
      .catch(() => {})
  }, [])

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden relative">
      <div className="ambient-glow" />

      {/* Header */}
      <header className="relative z-10 px-6 pt-4 pb-2 shrink-0 flex items-center justify-between">
        <h1 className="text-[20px] font-light text-foreground/90 tracking-tight">
          {getGreeting()}, <span className="font-semibold">Amit</span>
        </h1>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">
              Updated {formatRelativeTime(lastRefresh)}
            </span>
          )}
          <span className="text-[11px] text-muted-foreground/50 font-mono">
            {getFormattedDate()} · {time}
          </span>
        </div>
      </header>

      {/* 2-column grid */}
      <div className="relative z-10 flex-1 min-h-0 px-6 pb-6 grid grid-cols-2 gap-5">
        {/* Left column */}
        <div className="animate-column-enter min-h-0 flex flex-col gap-4" style={{ animationDelay: '0ms' }}>
          <TodoAgentWidget />
        </div>
        {/* Right column */}
        <div className="animate-column-enter min-h-0 flex flex-col gap-4" style={{ animationDelay: '80ms' }}>
          <LinearCycleWidget />
          <div className="grid grid-cols-2 gap-4 min-h-0 flex-1">
            <CalendarWidget />
            <GmailWidget />
          </div>
          <RecentWorkWidget />
        </div>
      </div>
    </div>
  )
}
