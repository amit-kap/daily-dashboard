import { useEffect, useState, useCallback, useRef } from 'react'
import { PRIORITY_LABELS, SOURCE_COLORS, type Recommendation, type SourceType } from '@/types/agent'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

interface TaskDrawerProps {
  rec: Recommendation | null
  onClose: () => void
}

const TABS: { key: SourceType; label: string; icon: React.ReactNode }[] = [
  { key: 'linear', label: 'Linear', icon: <svg viewBox="0 0 100 100" className="w-3.5 h-3.5" fill="none"><path fill="currentColor" d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189135 46.8891c-.01764375.2833.08887215.5599.28957165.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77832 4.5932-.92588465 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z"/></svg> },
  { key: 'slack', label: 'Slack', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none"><path d="M21.6925 11.0766C22.9669 11.0766 24 10.0434 24 8.76905C24 7.49465 22.9668 6.46154 21.6924 6.46154C20.4179 6.46154 19.3846 7.49474 19.3846 8.76923V11.0766H21.6925ZM15.2308 11.0766C16.5053 11.0766 17.5385 10.0434 17.5385 8.76886V2.30769C17.5385 1.03319 16.5053 0 15.2308 0C13.9563 0 12.9231 1.03319 12.9231 2.30769V8.76886C12.9231 10.0434 13.9563 11.0766 15.2308 11.0766Z" fill="#2EB67D"/><path d="M2.3075 12.9234C1.0331 12.9234 0 13.9566 0 15.231C0 16.5054 1.0332 17.5385 2.30759 17.5385C3.58209 17.5385 4.61538 16.5053 4.61538 15.2308V12.9234H2.3075ZM8.76923 12.9234C7.49474 12.9234 6.46154 13.9566 6.46154 15.2311V21.6923C6.46154 22.9668 7.49474 24 8.76923 24C10.0437 24 11.0769 22.9668 11.0769 21.6923V15.2311C11.0769 13.9566 10.0437 12.9234 8.76923 12.9234Z" fill="#E01E5A"/><path d="M12.9234 21.6925C12.9234 22.9669 13.9566 24 15.231 24C16.5054 24 17.5385 22.9668 17.5385 21.6924C17.5385 20.4179 16.5053 19.3846 15.2308 19.3846H12.9234V21.6925ZM12.9234 15.2308C12.9234 16.5053 13.9566 17.5385 15.2311 17.5385H21.6923C22.9668 17.5385 24 16.5053 24 15.2308C24 13.9563 22.9668 12.9231 21.6923 12.9231H15.2311C13.9566 12.9231 12.9234 13.9563 12.9234 15.2308Z" fill="#ECB22E"/><path d="M11.0766 2.3075C11.0766 1.0331 10.0434 0 8.76905 0C7.49465 0 6.46154 1.0332 6.46154 2.30759C6.46154 3.5821 7.49474 4.61538 8.76923 4.61538H11.0766V2.3075ZM11.0766 8.76923C11.0766 7.49474 10.0434 6.46154 8.76886 6.46154H2.30769C1.03319 6.46154 0 7.49474 0 8.76923C0 10.0437 1.03319 11.0769 2.30769 11.0769H8.76886C10.0434 11.0769 11.0766 10.0437 11.0766 8.76923Z" fill="#36C5F0"/></svg> },
  { key: 'notion', label: 'Notion', icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none"><path d="M1.94582 1.03507L15.2426 0.0549138C16.8754 -0.0852692 17.2956 0.00863452 18.3218 0.754884L22.5663 3.74104C23.2667 4.25454 23.5 4.39435 23.5 4.95414V21.3321C23.5 22.3585 23.1266 22.9656 21.8205 23.0585L6.37909 23.9919C5.39872 24.0388 4.93212 23.8988 4.41871 23.2452L1.29299 19.1857C0.73291 18.4386 0.5 17.8795 0.5 17.2254V2.66757C0.5 1.82817 0.873645 1.12802 1.94582 1.03507Z" fill="white"/><path d="M15.2426 0.0549138C16.8754 -0.0852692 17.2956 0.00863452 18.3218 0.754884L22.5663 3.74104C23.2667 4.25454 23.5 4.39435 23.5 4.95414V21.3321C23.5 22.3585 23.1266 22.9656 21.8205 23.0585L6.37909 23.9919C5.39872 24.0388 4.93212 23.8988 4.41871 23.2452L1.29299 19.1857C0.73291 18.4386 0.5 17.8795 0.5 17.2254V2.66757C0.5 1.82817 0.873645 1.12802 1.94582 1.03507L15.2426 0.0549138ZM21.9139 6.35395C21.9139 5.74791 21.681 5.421 21.1668 5.46762L6.00484 6.35395C5.44533 6.40102 5.25876 6.68117 5.25876 7.28758V21.192C5.25878 21.9393 5.63184 22.2188 6.47148 22.1725L20.9803 21.3321C21.8203 21.286 21.9139 20.772 21.9139 20.1649V6.35395ZM19.5817 8.03345C19.6748 8.45381 19.5817 8.87369 19.161 8.92093L18.4619 9.06054V19.3255C17.8549 19.6521 17.2954 19.8388 16.829 19.8388C16.0823 19.8388 15.8952 19.6053 15.3359 18.9058L10.7633 11.7202V18.6723L12.2101 18.9993C12.2101 18.9993 12.2102 19.8388 11.0428 19.8388L7.82446 20.0256C7.73096 19.8388 7.82454 19.3726 8.15097 19.2791L8.99076 19.0462V9.85396L7.8247 9.76037C7.73128 9.34001 7.96414 8.734 8.61773 8.68693L12.0702 8.45397L16.829 15.7331V9.29374L15.6156 9.15436C15.5224 8.6405 15.8952 8.26736 16.3618 8.22109L19.5817 8.03345ZM17.8549 1.96831C17.4349 1.64185 16.8751 1.26795 15.8024 1.36147L3.01908 2.29485C2.55294 2.34113 2.45979 2.57444 2.64543 2.76147L4.46611 4.20784C5.21188 4.81428 5.49163 4.76811 6.89197 4.67459L20.0937 3.88102C20.3737 3.88102 20.141 3.60155 20.0475 3.55502L17.8549 1.96831Z" fill="black"/></svg> },
  { key: 'fireflies', label: 'Fireflies', icon: <svg viewBox="0 0 22 24" className="w-3.5 h-3.5" fill="none"><path fill="url(#fft-a)" d="M7.36 2H.787v6.527H7.36z"/><path fill="url(#fft-b)" d="M15.149 9.88H8.574v6.526h6.575z"/><path fill="url(#fft-c)" d="M15.149 2H8.574v6.527h12.212v-.933a5.57 5.57 0 0 0-1.651-3.956A5.66 5.66 0 0 0 15.15 2z"/><path fill="url(#fft-d)" d="M.786 9.88v6.526c0 1.484.594 2.907 1.65 3.956A5.66 5.66 0 0 0 6.423 22h.939V9.88z"/><defs><linearGradient id="fft-a" x1="16.868" x2="-10.77" y1="18.512" y2="-10.526" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="1" stopColor="#3B73FF"/></linearGradient><linearGradient id="fft-b" x1="16.964" x2="-10.674" y1="18.423" y2="-10.616" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3C82"/><stop offset="1" stopColor="#3B73FF"/></linearGradient><linearGradient id="fft-c" x1="21.555" x2="12.19" y1="14.055" y2="-19.882" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="1" stopColor="#3B73FF"/></linearGradient><linearGradient id="fft-d" x1="12.338" x2="-21.187" y1="22.824" y2="12.611" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="1" stopColor="#3B73FF"/></linearGradient></defs></svg> },
]

const STATUS_BADGE: Record<string, string> = {
  'TODO': 'bg-zinc-500/20 text-zinc-700 dark:bg-zinc-600/30 dark:text-zinc-300',
  'In Progress': 'bg-yellow-500/20 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  'In Review': 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Done': 'bg-green-500/20 text-green-700 dark:bg-green-500/20 dark:text-green-300',
}

const PRIORITY_BADGE: Record<number, string> = {
  1: 'bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  2: 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  3: 'bg-yellow-500/20 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400',
  4: 'bg-zinc-500/15 text-zinc-600 dark:bg-zinc-600/20 dark:text-zinc-400',
}

export default function TaskDrawer({ rec, onClose }: TaskDrawerProps) {
  const [activeTab, setActiveTab] = useState<SourceType>('linear')
  const [copied, setCopied] = useState(false)
  const [width, setWidth] = useState(580)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    if (rec) setActiveTab(rec.sources[0] || 'linear')
  }, [rec])

  const isOpen = rec !== null

  const handleClaude = () => {
    if (!rec) return
    navigator.clipboard.writeText(`claude "Work on: ${rec.identifier} - ${rec.title}"`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const delta = startX.current - e.clientX
      setWidth(Math.max(460, Math.min(window.innerWidth * 0.85, startW.current + delta)))
    }
    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width])

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[580px] max-w-[85vw] gap-0 p-0 !bg-white dark:!bg-zinc-900 shadow-2xl"
        style={{ width: `${width}px` }}
      >
        {rec && (
          <>
            {/* Drag handle */}
            <div
              onMouseDown={onMouseDown}
              className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-10 hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors"
            />

            {/* ── HEADER ── */}
            <SheetHeader className="px-6 pt-6 pb-5 space-y-0">
              {/* Title */}
              <SheetTitle className="text-[18px] font-semibold leading-tight tracking-tight flex items-center gap-2.5 mb-4">
                <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-foreground/10 text-foreground/60 text-[13px] font-bold font-mono tabular-nums">
                  {rec.rank}
                </span>
                {rec.title}
              </SheetTitle>

              {/* Row 3: actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="default"
                  onClick={() => window.open(rec.url, '_blank')}
                  className="h-8 px-3 text-[13px]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 mr-1.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Open in Linear
                </Button>
                <Button
                  variant="ghost"
                  size="default"
                  onClick={handleClaude}
                  className="h-8 px-3 text-[13px]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none stroke-2 mr-1.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy command'}
                </Button>
              </div>
            </SheetHeader>

            {/* ── AGENT SUMMARY ── */}
            <div className="mx-6 mb-5 p-4 rounded-lg bg-white dark:bg-zinc-800 border border-border/60 shadow-sm">
              <div className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-1.5">
                Agent says
              </div>
              <div className="text-[13px] text-foreground leading-relaxed">
                {rec.reasoning}
              </div>
            </div>

            {/* ── SOURCE TABS ── */}
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as SourceType)}
              className="flex-1 min-h-0 flex flex-col"
            >
              <TabsList variant="line" className="w-full justify-start px-6 bg-transparent border-b border-border/30 rounded-none h-9 shrink-0 gap-0">
                {TABS.map(tab => {
                  const hasData = rec.sources.includes(tab.key)
                  return (
                    <TabsTrigger
                      key={tab.key}
                      value={tab.key}
                      disabled={!hasData}
                      className="px-3 h-9 text-[12px] font-medium rounded-none border-none gap-1.5 after:!bottom-0"
                    >
                      <span className={cn('shrink-0', !hasData && 'opacity-20')}>
                        {tab.icon}
                      </span>
                      {tab.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-6">
                  <TabsContent value="linear"><LinearTab rec={rec} /></TabsContent>
                  <TabsContent value="slack"><SlackTab rec={rec} /></TabsContent>
                  <TabsContent value="notion"><NotionTab rec={rec} /></TabsContent>
                  <TabsContent value="fireflies"><FirefliesTab rec={rec} /></TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Tab content ──

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-semibold mb-2">
      {children}
    </div>
  )
}

function LinearTab({ rec }: { rec: Recommendation }) {
  const { linear } = rec
  return (
    <div className="flex flex-col gap-6">
      {/* Properties grid */}
      <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[12px] items-center">
        <span className="text-muted-foreground/60">Status</span>
        <span className={cn('inline-flex w-fit font-semibold px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wide', STATUS_BADGE[rec.stateName] || STATUS_BADGE['TODO'])}>
          {rec.stateName.toUpperCase()}
        </span>

        <span className="text-muted-foreground/60">Priority</span>
        <span className={cn('inline-flex w-fit font-semibold px-1.5 py-0.5 rounded-sm text-[10px] tracking-wide', PRIORITY_BADGE[rec.priority] || PRIORITY_BADGE[4])}>
          {PRIORITY_LABELS[rec.priority] || 'None'}
        </span>

        {linear.assignee && <>
          <span className="text-muted-foreground/60">Assignee</span>
          <span className="text-foreground/80">{linear.assignee}</span>
        </>}

        {linear.estimate != null && <>
          <span className="text-muted-foreground/60">Estimate</span>
          <span className="text-foreground/80 font-mono">{linear.estimate} pts</span>
        </>}

        {linear.dueDate && <>
          <span className="text-muted-foreground/60">Due</span>
          <span className="text-foreground/80 font-mono">{linear.dueDate}</span>
        </>}

        {(rec.projectName || linear.projectName) && <>
          <span className="text-muted-foreground/60">Project</span>
          <span className="text-foreground/80">{rec.projectName || linear.projectName}</span>
        </>}

        {linear.cycleName && <>
          <span className="text-muted-foreground/60">Cycle</span>
          <span className="text-foreground/80">{linear.cycleName}</span>
        </>}

        {linear.labels?.length > 0 && <>
          <span className="text-muted-foreground/60">Labels</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {linear.labels.map(l => (
              <span key={l} className="text-[11px] font-medium px-1.5 py-0.5 rounded-sm bg-muted/50 text-muted-foreground/80">
                {l}
              </span>
            ))}
          </div>
        </>}

        {linear.createdAt && <>
          <span className="text-muted-foreground/60">Created</span>
          <span className="text-foreground/80 font-mono">{new Date(linear.createdAt).toLocaleDateString()}</span>
        </>}

        {linear.updatedAt && <>
          <span className="text-muted-foreground/60">Updated</span>
          <span className="text-foreground/80 font-mono">{new Date(linear.updatedAt).toLocaleDateString()}</span>
        </>}
      </div>

      {/* Parent issue */}
      {linear.parentIssue && (
        <div>
          <SectionLabel>Parent Issue</SectionLabel>
          <div className="text-[12px] text-muted-foreground font-mono">
            {linear.parentIssue.identifier} — <span className="font-sans">{linear.parentIssue.title}</span>
          </div>
        </div>
      )}

      {/* Description */}
      {linear.description && (
        <div>
          <SectionLabel>Description</SectionLabel>
          <div className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {linear.description}
          </div>
        </div>
      )}

      {/* Sub-issues */}
      {linear.subIssues?.length > 0 && (
        <div>
          <SectionLabel>Sub-issues</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {linear.subIssues.map(i => (
              <div key={i.identifier} className="flex items-center gap-2 text-[12px]">
                <span className="font-mono text-muted-foreground">{i.identifier}</span>
                <span className="text-foreground/70">{i.title}</span>
                {i.stateName && (
                  <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide', STATUS_BADGE[i.stateName] || STATUS_BADGE['TODO'])}>
                    {i.stateName.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocks */}
      {linear.blockedIssues?.length > 0 && (
        <div>
          <SectionLabel>Blocks</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {linear.blockedIssues.map(i => (
              <div key={i.identifier} className="text-[12px] text-muted-foreground font-mono">
                {i.identifier} — <span className="font-sans">{i.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blocked by */}
      {linear.blockingIssues?.length > 0 && (
        <div>
          <SectionLabel>Blocked by</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {linear.blockingIssues.map(i => (
              <div key={i.identifier} className="text-[12px] text-muted-foreground font-mono">
                {i.identifier} — <span className="font-sans">{i.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related issues */}
      {linear.relatedIssues?.length > 0 && (
        <div>
          <SectionLabel>Related</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {linear.relatedIssues.map(i => (
              <div key={i.identifier} className="text-[12px] text-muted-foreground font-mono">
                {i.identifier} — <span className="font-sans">{i.title}</span>
                {i.relation && <span className="text-[10px] text-muted-foreground/40 ml-2">({i.relation})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {linear.attachments?.length > 0 && (
        <div>
          <SectionLabel>Attachments</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {linear.attachments.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener" className="text-[12px] text-blue-500 hover:text-blue-400 hover:underline">
                {a.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {linear.comments?.length > 0 && (
        <div>
          <SectionLabel>Comments ({linear.comments.length})</SectionLabel>
          <div className="flex flex-col gap-3">
            {linear.comments.map((c, i) => (
              <div key={i} className="text-[13px] text-muted-foreground leading-relaxed p-3.5 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground/70">{c.author}</span>
                  <span className="text-[10px] text-muted-foreground/40 font-mono">{c.date}</span>
                </div>
                <div className="whitespace-pre-wrap">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SlackTab({ rec }: { rec: Recommendation }) {
  if (!rec.slack) return <EmptyTab source="Slack" />
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/60 font-medium">
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {rec.slack.channelName}
      </div>
      <div className="flex flex-col gap-2.5">
        {rec.slack.messages.map((m, i) => (
          <div key={i} className="p-3.5 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[12px] font-semibold text-foreground/80">{m.author}</span>
              <span className="text-[10px] text-muted-foreground/40 font-mono">{m.ts}</span>
            </div>
            <div className="text-[13px] text-muted-foreground leading-relaxed">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NotionTab({ rec }: { rec: Recommendation }) {
  if (!rec.notion) return <EmptyTab source="Notion" />
  return (
    <div className="flex flex-col gap-2.5">
      {rec.notion.pages.map((p, i) => (
        <a
          key={i}
          href={p.url}
          target="_blank"
          rel="noopener"
          className="block p-3.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
        >
          <div className="text-[13px] font-semibold text-foreground/80 mb-1.5 flex items-center gap-2 group-hover:text-foreground transition-colors">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 flex-shrink-0 text-muted-foreground/50">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            {p.title}
          </div>
          <div className="text-[12px] text-muted-foreground/60 leading-relaxed ml-[22px]">{p.excerpt}</div>
        </a>
      ))}
    </div>
  )
}

function FirefliesTab({ rec }: { rec: Recommendation }) {
  if (!rec.fireflies) return <EmptyTab source="Fireflies" />
  return (
    <div className="flex flex-col gap-3">
      {rec.fireflies.meetings.map((m, i) => (
        <div key={i} className="p-3.5 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[13px] font-semibold text-foreground/80 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 flex-shrink-0 text-muted-foreground/50">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              {m.title}
            </div>
            <span className="text-[10px] text-muted-foreground/40 font-mono">{m.date}</span>
          </div>
          {m.actionItems.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              <SectionLabel>Action Items</SectionLabel>
              {m.actionItems.map((a, j) => (
                <div key={j} className="text-[12px] text-muted-foreground leading-relaxed pl-3 border-l-2 border-amber-400/40">
                  {a}
                </div>
              ))}
            </div>
          )}
          {m.keywords.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {m.keywords.map((k, j) => (
                <Badge key={j} variant="secondary" className="text-[10px] h-auto">{k}</Badge>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function EmptyTab({ source }: { source: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-[12px] text-muted-foreground/30">
      No {source} data for this task
    </div>
  )
}
