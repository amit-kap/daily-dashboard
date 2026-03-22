import { useRecommendations } from '@/hooks/useRecommendations'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STATUS_ORDER = ['TODO', 'In Progress', 'In Review', 'Done'] as const

const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  'TODO': { label: 'To Do', dot: 'bg-zinc-500 dark:bg-zinc-400' },
  'In Progress': { label: 'Progress', dot: 'bg-yellow-500 dark:bg-yellow-400' },
  'In Review': { label: 'Review', dot: 'bg-blue-500 dark:bg-blue-400' },
  'Done': { label: 'Done', dot: 'bg-green-500 dark:bg-green-400' },
}

export default function LinearCycleWidget() {
  const { recommendations, cycleEndsAt, loading } = useRecommendations()

  const cycleName = recommendations[0]?.linear.cycleName ?? null
  const cycleEnd = cycleEndsAt ? new Date(cycleEndsAt) : null
  const now = new Date()

  const statusCounts: Record<string, number> = {}
  for (const rec of recommendations) {
    statusCounts[rec.stateName] = (statusCounts[rec.stateName] || 0) + 1
  }
  const total = recommendations.length

  const daysLeft = cycleEnd
    ? Math.max(0, Math.ceil((cycleEnd.getTime() - now.getTime()) / 86400000))
    : null

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const cycleStart = cycleEnd ? new Date(cycleEnd.getTime() - 14 * 24 * 60 * 60 * 1000) : null
  const daysElapsed = cycleStart
    ? Math.max(0, Math.ceil((now.getTime() - cycleStart.getTime()) / 86400000))
    : null

  const cycleDuration = cycleEnd && cycleStart ? cycleEnd.getTime() - cycleStart.getTime() : 1
  const elapsed = cycleStart ? Math.max(0, now.getTime() - cycleStart.getTime()) : 0
  const progressPct = Math.min(100, Math.round((elapsed / cycleDuration) * 100))

  if (loading || !cycleName) return null

  return (
    <Card size="sm" className="w-full h-fit !py-0 shrink-0">
      <CardHeader className="px-3.5 !py-2.5 !flex !flex-row items-center justify-between border-b border-border/30">
        <CardTitle className="text-[14px] font-semibold text-foreground/90 tracking-tight flex items-center gap-2">
          <svg viewBox="0 0 100 100" className="w-3.5 h-3.5 shrink-0" fill="none">
            <path fill="currentColor" d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189135 46.8891c-.01764375.2833.08887215.5599.28957165.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77832 4.5932-.92588465 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z"/>
          </svg>
          {cycleName}
          <span className="text-[14px] tabular-nums text-muted-foreground/60 font-mono font-normal">
            ({total})
          </span>
        </CardTitle>
        <div
          className="flex items-center gap-2.5 shrink-0"
          title={`${cycleStart ? formatDate(cycleStart) : ''} → ${cycleEnd ? formatDate(cycleEnd) : ''}\n${daysElapsed}d elapsed, ${daysLeft}d remaining`}
        >
          <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden cursor-default">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progressPct >= 80 ? 'bg-red-400' : progressPct >= 60 ? 'bg-amber-400' : 'bg-blue-400'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className={cn(
            'text-[11px] font-mono',
            daysLeft !== null && daysLeft <= 3 ? 'text-red-400' : daysLeft !== null && daysLeft <= 7 ? 'text-amber-400' : 'text-muted-foreground/50'
          )}>
            {daysLeft}d left
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 flex flex-col gap-3">
        {/* Status counts — primary */}
        <div className="flex items-end justify-between">
          {STATUS_ORDER.map(status => {
            const count = statusCounts[status] || 0
            const config = STATUS_CONFIG[status]
            return (
              <div key={status} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[18px] font-mono font-semibold text-foreground/80 tabular-nums leading-none">
                  {count}
                </span>
                <div className="flex items-center gap-1">
                  <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">
                    {config.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}
