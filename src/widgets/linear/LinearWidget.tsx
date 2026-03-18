import { useState } from 'react'
import { useLinear } from '../../hooks/useLinear'
import { type DashboardIssue, type StatusCategory } from '../../types/linear'
import CycleNav from './CycleNav'
import FilterTabs from './FilterTabs'
import TaskCard from './TaskCard'
import TaskDrawer from './TaskDrawer'

export default function LinearWidget() {
  const { issues, cycle, workflowStates, loading, error, navigateCycle, updateIssueState, refresh } = useLinear()
  const [activeTab, setActiveTab] = useState<StatusCategory>('todo')
  const [selectedIssue, setSelectedIssue] = useState<DashboardIssue | null>(null)

  const counts: Record<StatusCategory, number> = {
    todo: issues.todo.length,
    inProgress: issues.inProgress.length,
    inReview: issues.inReview.length,
    deployed: issues.deployed.length,
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="w-80 h-[420px] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#09090b] flex flex-col">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Linear</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-2">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{error}</p>
          {error === "Couldn't reach Linear" && (
            <button onClick={refresh} className="text-[10px] text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200">
              Retry
            </button>
          )}
          {error === 'Invalid API key' && (
            <a href="https://linear.app/settings/api" target="_blank" rel="noopener" className="text-[10px] text-zinc-500 dark:text-zinc-400 underline hover:text-zinc-700 dark:hover:text-zinc-200">
              Linear Settings
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 h-[420px] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#09090b] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
        <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Linear</span>
        <CycleNav cycle={cycle} onNavigate={navigateCycle} />
      </div>

      {/* Filter tabs */}
      <FilterTabs activeTab={activeTab} counts={counts} onTabChange={setActiveTab} />

      {/* Card list */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 scrollbar-none">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">Loading...</span>
          </div>
        ) : issues[activeTab].length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">No tasks</span>
          </div>
        ) : (
          issues[activeTab].map(issue => (
            <TaskCard
              key={issue.id}
              issue={issue}
              deployed={activeTab === 'deployed'}
              onClick={() => setSelectedIssue(issue)}
            />
          ))
        )}
      </div>

      {/* Drawer */}
      <TaskDrawer
        issue={selectedIssue}
        workflowStates={workflowStates}
        onClose={() => setSelectedIssue(null)}
        onStatusChange={(issueId, stateId) => {
          updateIssueState(issueId, stateId)
        }}
      />
    </div>
  )
}
