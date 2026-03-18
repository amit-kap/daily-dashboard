import { useState } from 'react'
import { PRIORITY_COLORS, type DashboardIssue } from '../../types/linear'

interface TaskCardProps {
  issue: DashboardIssue
  deployed?: boolean
  onClick: () => void
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none stroke-2">
      <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TaskCard({ issue, deployed, onClick }: TaskCardProps) {
  const priorityColor = PRIORITY_COLORS[issue.priority]

  const handleLinear = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(issue.url, '_blank')
  }

  const [copied, setCopied] = useState(false)

  const handleClaude = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`claude "Work on: ${issue.identifier} - ${issue.title}"`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 px-3 mb-1 cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${
        deployed ? 'opacity-40 hover:opacity-60' : ''
      }`}
    >
      {/* Top row: priority dot + ID + action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
          {priorityColor && (
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: priorityColor }} />
          )}
          {issue.identifier}
        </div>
        {!deployed && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleLinear}
              title="Open in Linear"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 dark:text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
            >
              <ExternalLinkIcon />
            </button>
            <button
              onClick={handleClaude}
              title="Open in Claude"
              className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 dark:text-zinc-500 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors relative"
            >
              {copied ? <span className="text-[8px] text-green-500">Copied!</span> : <LayersIcon />}
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-200 leading-[1.4] line-clamp-2">
        {issue.title}
      </div>

      {/* Labels */}
      {issue.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {issue.labels.map(label => (
            <span
              key={label.id}
              className="text-[9px] font-medium px-1.5 py-px rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
