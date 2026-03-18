import { STATUS_CONFIG, type StatusCategory } from '../../types/linear'

const TABS: StatusCategory[] = ['todo', 'inProgress', 'inReview', 'deployed']

interface FilterTabsProps {
  activeTab: StatusCategory
  counts: Record<StatusCategory, number>
  onTabChange: (tab: StatusCategory) => void
}

export default function FilterTabs({ activeTab, counts, onTabChange }: FilterTabsProps) {
  return (
    <div className="flex border-b border-zinc-100 dark:border-zinc-800/60 px-3.5">
      {TABS.map(tab => {
        const config = STATUS_CONFIG[tab]
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            title={config.label}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-zinc-900 dark:border-zinc-200 text-zinc-900 dark:text-zinc-200'
                : 'border-transparent text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400'
            }`}
          >
            <span
              className={`w-[5px] h-[5px] rounded-full ${isActive ? 'opacity-100' : 'opacity-40'}`}
              style={{ backgroundColor: config.dot }}
            />
            {isActive && <span>{config.label}</span>}
            <span>{counts[tab]}</span>
          </button>
        )
      })}
    </div>
  )
}
