import { useState } from 'react'
import { useGmail } from '@/hooks/useGmail'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type View = 'recent' | 'all'

export default function GmailWidget() {
  const { emails, recentEmails, unreadCount, loading } = useGmail()
  const [view, setView] = useState<View>('recent')

  if (loading) return null

  const items = view === 'recent' ? recentEmails : emails
  const count = view === 'recent' ? recentEmails.length : unreadCount

  return (
    <Card size="sm" className="w-full min-h-0 flex-1 !py-0 flex flex-col overflow-hidden">
      <CardHeader className="px-3.5 !py-2.5 !flex !flex-row items-center justify-between border-b border-border/30">
        <CardTitle className="text-[14px] font-semibold text-foreground/90 tracking-tight flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
            <path d="M5.45455 21V11.7297L2.57875 9.0994L0 7.63981V19.3641C0 20.2693.733636 21 1.63636 21H5.45455Z" fill="#4285F4"/>
            <path d="M18.5455 21H22.3636C23.2691 21 24 20.2666 24 19.3641V7.63981L21.0792 9.31171L18.5455 11.7297V21Z" fill="#34A853"/>
            <path d="M5.45455 11.7297L5.06323 8.10743L5.45455 4.64058L12 9.54841L18.5455 4.64058L18.9832 7.92023L18.5455 11.7297L12 16.6375L5.45455 11.7297Z" fill="#EA4335"/>
            <path d="M18.5455 4.64058V11.7297L24 7.63981V5.45855C24 3.43544 21.69 2.2821 20.0727 3.49542L18.5455 4.64058Z" fill="#FBBC04"/>
            <path d="M0 7.63981L5.45455 11.7297V4.64058L3.92727 3.49542C2.30727 2.2821 0 3.43544 0 5.45855V7.63981Z" fill="#C5221F"/>
          </svg>
          Mail
          <span className="text-[14px] tabular-nums text-muted-foreground/60 font-mono font-normal">
            ({count})
          </span>
        </CardTitle>

        {/* Toggle */}
        <div className="flex items-center bg-muted/40 rounded-md p-0.5 text-[11px] font-medium">
          <button
            onClick={() => setView('recent')}
            className={cn(
              'px-2 py-0.5 rounded-sm transition-colors',
              view === 'recent' ? 'bg-background text-foreground/80 shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground/70'
            )}
          >
            Yesterday
          </button>
          <button
            onClick={() => setView('all')}
            className={cn(
              'px-2 py-0.5 rounded-sm transition-colors',
              view === 'all' ? 'bg-background text-foreground/80 shadow-sm' : 'text-muted-foreground/50 hover:text-muted-foreground/70'
            )}
          >
            All
          </button>
        </div>
      </CardHeader>

      <CardContent className="px-1.5 py-1.5 flex flex-col gap-0.5 overflow-y-auto scrollbar-none min-h-0 flex-1">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-center">
            <span className="text-[12px] text-muted-foreground/40">No new mail</span>
          </div>
        ) : (
          items.map(email => (
            <div
              key={email.id}
              className="flex flex-col gap-0.5 px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  'text-[13px] truncate',
                  email.starred ? 'text-foreground font-semibold' : 'text-foreground/70 font-medium'
                )}>
                  {email.starred && <span className="text-amber-400 mr-1">★</span>}
                  {email.from}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0">
                  {email.ts}
                </span>
              </div>
              <span className="text-[12px] text-muted-foreground/70 truncate">
                {email.subject}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
