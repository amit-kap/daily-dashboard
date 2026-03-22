import { useState } from 'react'
import { useRecommendations } from '@/hooks/useRecommendations'
import type { Recommendation } from '@/types/agent'
import TaskCard from './TaskCard'
import TaskDrawer from './TaskDrawer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function TodoAgentWidget() {
  const { recommendations, summary, generatedAt, loading, error, stale, refresh } = useRecommendations()
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null)

  // Error state
  if (error && !loading) {
    return (
      <Card size="sm" className="w-full h-full">
        <Header count={0} />
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-2">
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground/60">Run the agent to generate recommendations</p>
          <Button variant="link" size="xs" onClick={refresh} className="text-xs text-muted-foreground">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card size="sm" className="w-full h-full gap-0 !py-0">
        <Header count={recommendations.length} />

        {/* Card list */}
        <ScrollArea className="flex-1 min-h-0 [&>[data-slot=scroll-area-scrollbar]]:hidden">
          <div className="px-1.5 py-1.5 flex flex-col gap-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-sm text-muted-foreground/50">Loading...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <span className="text-sm text-muted-foreground/50">No tasks</span>
              </div>
            ) : (
              recommendations.map((rec, i) => (
                <TaskCard
                  key={rec.identifier}
                  rec={rec}
                  active={selectedRec?.identifier === rec.identifier}
                  onClick={() => setSelectedRec(rec)}
                  index={i}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Drawer */}
      <TaskDrawer
        rec={selectedRec}
        onClose={() => setSelectedRec(null)}
      />
    </>
  )
}

function Header({ count }: { count: number }) {
  return (
    <CardHeader className="px-3.5 !py-2.5 items-center border-b border-border/30">
      <CardTitle className="text-[14px] font-semibold text-foreground/90 tracking-tight flex items-center gap-2">
        My Tasks
        {count > 0 && (
          <span className="text-[14px] tabular-nums text-muted-foreground/60 font-mono font-normal">
            ({count})
          </span>
        )}
      </CardTitle>
    </CardHeader>
  )
}
