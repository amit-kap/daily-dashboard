import type { DashboardCycle } from '../../types/linear'

interface CycleNavProps {
  cycle: DashboardCycle | null
  onNavigate: (direction: 'prev' | 'next') => void
}

function formatCycleTooltip(cycle: DashboardCycle): string {
  const start = new Date(cycle.startsAt)
  const end = new Date(cycle.endsAt)
  const now = new Date()
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const daysFromStart = Math.floor((now.getTime() - start.getTime()) / 86400000)
  const daysToEnd = Math.floor((end.getTime() - now.getTime()) / 86400000)

  let timing = ''
  if (daysToEnd < 0) {
    timing = `ended ${Math.abs(daysToEnd)} days ago`
  } else if (daysToEnd === 0) {
    timing = `started ${daysFromStart} days ago, ends today`
  } else {
    timing = `started ${daysFromStart} days ago, ${daysToEnd} days remaining`
  }

  return `${fmt(start)} – ${fmt(end)} (${timing})`
}

export default function CycleNav({ cycle, onNavigate }: CycleNavProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onNavigate('prev')}
        title="Previous cycle"
        className="text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 px-1 py-0.5 rounded"
      >
        &larr;
      </button>
      <span
        className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500"
        title={cycle ? formatCycleTooltip(cycle) : undefined}
      >
        {cycle ? `Cycle ${cycle.number}` : '—'}
      </span>
      <button
        onClick={() => onNavigate('next')}
        title="Next cycle"
        className="text-[11px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 px-1 py-0.5 rounded"
      >
        &rarr;
      </button>
    </div>
  )
}
