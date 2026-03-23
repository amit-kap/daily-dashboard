import { useRecentWork } from '@/hooks/useRecentWork'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function RecentWorkWidget() {
  const { data, loading } = useRecentWork()

  if (loading || !data) return null

  const totalCommits = data.projects.reduce((s, p) => s + p.commits, 0)

  return (
    <Card size="sm" className="w-full min-h-0 flex-1 !py-0 flex flex-col overflow-hidden">
      <CardHeader className="px-3.5 !py-2.5 items-center border-b border-border/30">
        <CardTitle className="text-[14px] font-semibold text-foreground/90 tracking-tight flex items-center gap-2">
          <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 shrink-0" fill="none">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="currentColor" className="text-foreground/70"/>
          </svg>
          Yesterday's Work
          <span className="text-[14px] tabular-nums text-muted-foreground/60 font-mono font-normal">
            ({totalCommits} commits)
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-1.5 py-1.5 overflow-y-auto scrollbar-none min-h-0 flex-1">
        <div className="flex flex-col gap-0.5">
          {data.projects.map(project => (
            <div key={project.folder} className="px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-foreground/85 font-mono">
                  {project.folder}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground/50 tabular-nums">
                  {project.commits} {project.commits === 1 ? 'commit' : 'commits'}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
                {project.summary}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
