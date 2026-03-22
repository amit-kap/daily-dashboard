import { useCalendar } from '@/hooks/useCalendar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function isNow(start: string, end: string) {
  const now = Date.now()
  return now >= new Date(start).getTime() && now < new Date(end).getTime()
}

function isPast(end: string) {
  return Date.now() >= new Date(end).getTime()
}

export default function CalendarWidget() {
  const { events, loading } = useCalendar()

  if (loading) return null

  return (
    <Card size="sm" className="w-full flex-1 min-h-0 !py-0 flex flex-col overflow-hidden">
      <CardHeader className="px-3.5 !py-2.5 items-center border-b border-border/30">
        <CardTitle className="text-[14px] font-semibold text-foreground/90 tracking-tight flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="none">
            <path d="M18.3158 5.68419L12.6317 5.05263L5.68428 5.68419L5.0526 12L5.68416 18.3159L12 19.1053L18.3158 18.3159L18.9474 11.8422L18.3158 5.68419Z" fill="white"/>
            <path d="M8.27532 15.4832C7.80324 15.1642 7.47636 14.6985 7.29792 14.0826L8.39376 13.6311C8.49324 14.01 8.66688 14.3037 8.9148 14.5121C9.16116 14.7205 9.46116 14.8232 9.81168 14.8232C10.1701 14.8232 10.478 14.7142 10.7353 14.4963C10.9926 14.2784 11.1222 14.0004 11.1222 13.6642C11.1222 13.32 10.9864 13.0389 10.7148 12.8211C10.4432 12.6033 10.1022 12.4942 9.6948 12.4942H9.06168V11.4095H9.63C9.98052 11.4095 10.2758 11.3148 10.5158 11.1254C10.7558 10.9359 10.8758 10.6769 10.8758 10.3469C10.8758 10.0533 10.7684 9.81951 10.5538 9.64431C10.3391 9.46911 10.0674 9.38067 9.7374 9.38067C9.41532 9.38067 9.15948 9.46599 8.97 9.63807C8.78052 9.81015 8.64312 10.0217 8.55636 10.2712L7.47168 9.81963C7.61532 9.41223 7.87908 9.05223 8.26584 8.74119C8.65272 8.43015 9.14688 8.27379 9.74688 8.27379C10.1905 8.27379 10.59 8.35911 10.9438 8.53119C11.2974 8.70327 11.5753 8.94171 11.7758 9.24483C11.9764 9.54951 12.0758 9.89067 12.0758 10.2695C12.0758 10.6564 11.9827 10.9832 11.7964 11.2516C11.61 11.52 11.381 11.7252 11.1095 11.869V11.9337C11.4679 12.0837 11.76 12.3126 11.9905 12.6205C12.2195 12.9285 12.3347 13.2964 12.3347 13.7259C12.3347 14.1554 12.2257 14.539 12.0078 14.8754C11.7899 15.2117 11.4883 15.4769 11.1062 15.6695C10.7226 15.8621 10.2916 15.96 9.81312 15.96C9.25896 15.9616 8.7474 15.8021 8.27532 15.4832Z" fill="#1A73E8"/>
            <path d="M15 10.0454L13.8031 10.9154L13.2016 10.0028L15.36 8.44587H16.1874V15.7895H15V10.0454Z" fill="#1A73E8"/>
            <path d="M18.3158 24L24 18.3159L21.1579 17.0528L18.3158 18.3159L17.0527 21.1579L18.3158 24Z" fill="#EA4335"/>
            <path d="M4.42104 21.1579L5.68416 24H18.3157V18.3159H5.68416L4.42104 21.1579Z" fill="#34A853"/>
            <path d="M1.89468 3.05176e-05C0.84792 3.05176e-05 0 0.84795 0 1.89471V18.3157L2.84208 19.5789L5.68416 18.3157L5.68428 5.68419H18.3157L19.5788 2.84211L18.3158 3.05176e-05H1.89468Z" fill="#4285F4"/>
            <path d="M0 18.3159V22.1053C0 23.1522 0.84792 24 1.89468 24H5.68416V18.3159H0Z" fill="#188038"/>
            <path d="M18.3158 5.68419V18.3157H24V5.68419L21.1579 4.42107L18.3158 5.68419Z" fill="#FBBC04"/>
            <path d="M24 5.68419V1.89471C24 0.84783 23.1521 3.05176e-05 22.1053 3.05176e-05H18.3158V5.68419H24Z" fill="#1967D2"/>
          </svg>
          Today
          <span className="text-[14px] tabular-nums text-muted-foreground/60 font-mono font-normal">
            ({events.length})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-1.5 py-1.5 flex flex-col gap-0.5 overflow-y-auto scrollbar-none min-h-0 flex-1">
        {events.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <span className="text-[12px] text-muted-foreground/40">No meetings today</span>
          </div>
        ) : (
          events.map(evt => {
            const active = isNow(evt.start, evt.end)
            const past = isPast(evt.end)
            return (
              <div
                key={evt.id}
                className={cn(
                  'flex gap-3 px-3 py-2 rounded-md transition-colors',
                  active && 'bg-blue-500/10',
                  past && 'opacity-50'
                )}
              >
                {/* Time */}
                <div className="shrink-0 w-[52px] pt-0.5">
                  <span className={cn(
                    'text-[12px] font-mono tabular-nums',
                    active ? 'text-blue-500 dark:text-blue-400' : 'text-muted-foreground/60'
                  )}>
                    {formatTime(evt.start)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />}
                    <span className={cn(
                      'text-[13px] font-medium truncate',
                      active ? 'text-foreground' : 'text-foreground/70'
                    )}>
                      {evt.title}
                    </span>
                  </div>
                  {evt.attendees && evt.attendees.length > 0 && (
                    <span className="text-[11px] text-muted-foreground/50 truncate">
                      {evt.attendees.join(', ')}
                    </span>
                  )}
                  {evt.insight && !past && (
                    <span className="text-[11px] text-amber-400/70 leading-snug line-clamp-2 italic">
                      {evt.insight}
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="shrink-0 pt-0.5">
                  <span className="text-[11px] font-mono text-muted-foreground/45">
                    {getDuration(evt.start, evt.end)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

function getDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}
