import { useEffect, useState } from 'react'
import { PRIORITY_COLORS, type DashboardIssue } from '../../types/linear'

interface TaskDrawerProps {
  issue: DashboardIssue | null
  workflowStates: { id: string; name: string; type: string }[]
  onClose: () => void
  onStatusChange: (issueId: string, stateId: string) => void
}

const PRIORITY_LABELS: Record<number, string> = {
  0: 'None', 1: 'Urgent', 2: 'High', 3: 'Medium', 4: 'Low',
}

export default function TaskDrawer({ issue, workflowStates, onClose, onStatusChange }: TaskDrawerProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!issue) return null

  const priorityColor = PRIORITY_COLORS[issue.priority]

  const handleClaude = () => {
    navigator.clipboard.writeText(`claude "Work on: ${issue.identifier} - ${issue.title}"`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-sm transition-opacity ${issue ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[51] w-[340px] max-w-[85vw] h-screen bg-zinc-50 dark:bg-zinc-900/95 border-l border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 ${
          issue ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between">
          <div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mb-1">{issue.identifier}</div>
            <div className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100 leading-[1.4]">{issue.title}</div>
          </div>
          <button
            onClick={onClose}
            title="Close"
            className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 text-base px-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Project */}
          {issue.project && (
            <div className="mb-3.5">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Project</div>
              <div className="text-[13px] text-zinc-600 dark:text-zinc-400">{issue.project.name}</div>
            </div>
          )}

          {/* Priority */}
          <div className="mb-3.5">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Priority</div>
            <span
              className="text-[11px] px-2 py-0.5 rounded"
              style={{
                color: priorityColor || '#a1a1aa',
                backgroundColor: priorityColor ? `${priorityColor}1a` : '#a1a1aa1a',
              }}
            >
              {PRIORITY_LABELS[issue.priority] || 'None'}
            </span>
          </div>

          {/* Description */}
          {issue.description && (
            <div className="mb-3.5">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Description</div>
              <div className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{issue.description}</div>
            </div>
          )}

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="mb-3.5">
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Labels</div>
              <div className="flex gap-1 flex-wrap">
                {issue.labels.map(l => (
                  <span key={l.id} className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                    {l.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status + change */}
          <div className="mb-3.5">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-0.5">Status</div>
            <select
              value={issue.state.id}
              onChange={(e) => onStatusChange(issue.id, e.target.value)}
              className="text-[13px] text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 cursor-pointer"
            >
              {workflowStates.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2">
          <button
            onClick={() => window.open(issue.url, '_blank')}
            className="flex-1 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Linear
          </button>
          <button
            onClick={handleClaude}
            className="flex-1 py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {copied ? 'Copied!' : 'Claude'}
          </button>
        </div>
      </div>
    </>
  )
}
