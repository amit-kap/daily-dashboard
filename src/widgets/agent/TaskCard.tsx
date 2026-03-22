import { SOURCE_COLORS, type Recommendation, type SourceType } from '@/types/agent'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  rec: Recommendation
  active: boolean
  onClick: () => void
  index: number
}

function SourceIcon({ type }: { type: SourceType }) {
  const icons: Record<SourceType, React.ReactNode> = {
    linear: (
      <svg viewBox="0 0 100 100" className="w-3.5 h-3.5" fill="none">
        <path fill="currentColor" d="M1.22541 61.5228c-.2225-.9485.90748-1.5459 1.59638-.857L39.3342 97.1782c.6889.6889.0915 1.8189-.857 1.5964C20.0515 94.4522 5.54779 79.9485 1.22541 61.5228ZM.00189135 46.8891c-.01764375.2833.08887215.5599.28957165.7606L52.3503 99.7085c.2007.2007.4773.3075.7606.2896 2.3692-.1476 4.6938-.46 6.9624-.9259.7645-.157 1.0301-1.0963.4782-1.6481L2.57595 39.4485c-.55186-.5519-1.49117-.2863-1.648174.4782-.465915 2.2686-.77832 4.5932-.92588465 6.9624ZM4.21093 29.7054c-.16649.3738-.08169.8106.20765 1.1l64.77602 64.776c.2894.2894.7262.3742 1.1.2077 1.7861-.7956 3.5171-1.6927 5.1855-2.684.5521-.328.6373-1.0867.1832-1.5407L8.43566 24.3367c-.45409-.4541-1.21271-.3689-1.54074.1832-.99132 1.6684-1.88843 3.3994-2.68399 5.1855ZM12.6587 18.074c-.3701-.3701-.393-.9637-.0443-1.3541C21.7795 6.45931 35.1114 0 49.9519 0 77.5927 0 100 22.4073 100 50.0481c0 14.8405-6.4593 28.1724-16.7199 37.3375-.3903.3487-.984.3258-1.3542-.0443L12.6587 18.074Z"/>
      </svg>
    ),
    slack: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
        <path d="M21.6925 11.0766C22.9669 11.0766 24 10.0434 24 8.76905C24 7.49465 22.9668 6.46154 21.6924 6.46154C20.4179 6.46154 19.3846 7.49474 19.3846 8.76923V11.0766H21.6925ZM15.2308 11.0766C16.5053 11.0766 17.5385 10.0434 17.5385 8.76886V2.30769C17.5385 1.03319 16.5053 0 15.2308 0C13.9563 0 12.9231 1.03319 12.9231 2.30769V8.76886C12.9231 10.0434 13.9563 11.0766 15.2308 11.0766Z" fill="#2EB67D"/>
        <path d="M2.3075 12.9234C1.0331 12.9234 0 13.9566 0 15.231C0 16.5054 1.0332 17.5385 2.30759 17.5385C3.58209 17.5385 4.61538 16.5053 4.61538 15.2308V12.9234H2.3075ZM8.76923 12.9234C7.49474 12.9234 6.46154 13.9566 6.46154 15.2311V21.6923C6.46154 22.9668 7.49474 24 8.76923 24C10.0437 24 11.0769 22.9668 11.0769 21.6923V15.2311C11.0769 13.9566 10.0437 12.9234 8.76923 12.9234Z" fill="#E01E5A"/>
        <path d="M12.9234 21.6925C12.9234 22.9669 13.9566 24 15.231 24C16.5054 24 17.5385 22.9668 17.5385 21.6924C17.5385 20.4179 16.5053 19.3846 15.2308 19.3846H12.9234V21.6925ZM12.9234 15.2308C12.9234 16.5053 13.9566 17.5385 15.2311 17.5385H21.6923C22.9668 17.5385 24 16.5053 24 15.2308C24 13.9563 22.9668 12.9231 21.6923 12.9231H15.2311C13.9566 12.9231 12.9234 13.9563 12.9234 15.2308Z" fill="#ECB22E"/>
        <path d="M11.0766 2.3075C11.0766 1.0331 10.0434 0 8.76905 0C7.49465 0 6.46154 1.0332 6.46154 2.30759C6.46154 3.5821 7.49474 4.61538 8.76923 4.61538H11.0766V2.3075ZM11.0766 8.76923C11.0766 7.49474 10.0434 6.46154 8.76886 6.46154H2.30769C1.03319 6.46154 0 7.49474 0 8.76923C0 10.0437 1.03319 11.0769 2.30769 11.0769H8.76886C10.0434 11.0769 11.0766 10.0437 11.0766 8.76923Z" fill="#36C5F0"/>
      </svg>
    ),
    notion: (
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
        <path d="M1.94582 1.03507L15.2426 0.0549138C16.8754 -0.0852692 17.2956 0.00863452 18.3218 0.754884L22.5663 3.74104C23.2667 4.25454 23.5 4.39435 23.5 4.95414V21.3321C23.5 22.3585 23.1266 22.9656 21.8205 23.0585L6.37909 23.9919C5.39872 24.0388 4.93212 23.8988 4.41871 23.2452L1.29299 19.1857C0.73291 18.4386 0.5 17.8795 0.5 17.2254V2.66757C0.5 1.82817 0.873645 1.12802 1.94582 1.03507Z" fill="white"/>
        <path d="M15.2426 0.0549138C16.8754 -0.0852692 17.2956 0.00863452 18.3218 0.754884L22.5663 3.74104C23.2667 4.25454 23.5 4.39435 23.5 4.95414V21.3321C23.5 22.3585 23.1266 22.9656 21.8205 23.0585L6.37909 23.9919C5.39872 24.0388 4.93212 23.8988 4.41871 23.2452L1.29299 19.1857C0.73291 18.4386 0.5 17.8795 0.5 17.2254V2.66757C0.5 1.82817 0.873645 1.12802 1.94582 1.03507L15.2426 0.0549138ZM21.9139 6.35395C21.9139 5.74791 21.681 5.421 21.1668 5.46762L6.00484 6.35395C5.44533 6.40102 5.25876 6.68117 5.25876 7.28758V21.192C5.25878 21.9393 5.63184 22.2188 6.47148 22.1725L20.9803 21.3321C21.8203 21.286 21.9139 20.772 21.9139 20.1649V6.35395ZM19.5817 8.03345C19.6748 8.45381 19.5817 8.87369 19.161 8.92093L18.4619 9.06054V19.3255C17.8549 19.6521 17.2954 19.8388 16.829 19.8388C16.0823 19.8388 15.8952 19.6053 15.3359 18.9058L10.7633 11.7202V18.6723L12.2101 18.9993C12.2101 18.9993 12.2102 19.8388 11.0428 19.8388L7.82446 20.0256C7.73096 19.8388 7.82454 19.3726 8.15097 19.2791L8.99076 19.0462V9.85396L7.8247 9.76037C7.73128 9.34001 7.96414 8.734 8.61773 8.68693L12.0702 8.45397L16.829 15.7331V9.29374L15.6156 9.15436C15.5224 8.6405 15.8952 8.26736 16.3618 8.22109L19.5817 8.03345ZM17.8549 1.96831C17.4349 1.64185 16.8751 1.26795 15.8024 1.36147L3.01908 2.29485C2.55294 2.34113 2.45979 2.57444 2.64543 2.76147L4.46611 4.20784C5.21188 4.81428 5.49163 4.76811 6.89197 4.67459L20.0937 3.88102C20.3737 3.88102 20.141 3.60155 20.0475 3.55502L17.8549 1.96831Z" fill="black"/>
      </svg>
    ),
    fireflies: (
      <svg viewBox="0 0 22 24" className="w-3.5 h-3.5" fill="none">
        <path fill="url(#ff-a)" d="M7.36 2H.787v6.527H7.36z"/>
        <path fill="url(#ff-b)" d="M15.149 9.88H8.574v6.526h6.575z"/>
        <path fill="url(#ff-c)" d="M15.149 2H8.574v6.527h12.212v-.933a5.57 5.57 0 0 0-1.651-3.956A5.66 5.66 0 0 0 15.15 2z"/>
        <path fill="url(#ff-d)" d="M.786 9.88v6.526c0 1.484.594 2.907 1.65 3.956A5.66 5.66 0 0 0 6.423 22h.939V9.88z"/>
        <path fill="url(#ff-e)" d="M.786 2 7.36 8.527H.786z" opacity="0.18"/>
        <path fill="url(#ff-f)" d="m8.574 9.88 6.575 6.526H8.574z" opacity="0.18"/>
        <path fill="url(#ff-g)" d="M.786 16.406c0 1.484.594 2.907 1.65 3.956A5.66 5.66 0 0 0 6.423 22h.939V9.88z" opacity="0.18"/>
        <path fill="url(#ff-h)" d="M15.15 2c1.494 0 2.928.59 3.985 1.638a5.57 5.57 0 0 1 1.65 3.956v.933H8.576z" opacity="0.18"/>
        <defs>
          <linearGradient id="ff-a" x1="16.868" x2="-10.77" y1="18.512" y2="-10.526" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.113" stopColor="#DE2D7A"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/></linearGradient>
          <linearGradient id="ff-b" x1="16.964" x2="-10.674" y1="18.423" y2="-10.616" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3C82"/><stop offset="0.103" stopColor="#F53E88"/><stop offset="0.274" stopColor="#DC4598"/><stop offset="0.492" stopColor="#B251B2"/><stop offset="0.745" stopColor="#7961D7"/><stop offset="0.994" stopColor="#3B73FF"/></linearGradient>
          <linearGradient id="ff-c" x1="21.555" x2="12.19" y1="14.055" y2="-19.882" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.113" stopColor="#DE2D7A"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/></linearGradient>
          <linearGradient id="ff-d" x1="12.338" x2="-21.187" y1="22.824" y2="12.611" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.113" stopColor="#DE2D7A"/><stop offset="0.3" stopColor="#C5388F"/><stop offset="0.54" stopColor="#9B4AB0"/><stop offset="0.818" stopColor="#6262DE"/><stop offset="0.994" stopColor="#3B73FF"/></linearGradient>
          <linearGradient id="ff-e" x1="-2.429" x2="6.961" y1="-6.152" y2="15.365" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.114" stopColor="#DE286E"/><stop offset="0.303" stopColor="#C52361"/><stop offset="0.544" stopColor="#9B1A4D"/><stop offset="0.825" stopColor="#620F30"/><stop offset="0.994" stopColor="#3D081E"/></linearGradient>
          <linearGradient id="ff-f" x1="5.359" x2="14.749" y1="1.727" y2="23.245" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.114" stopColor="#DE286E"/><stop offset="0.303" stopColor="#C52361"/><stop offset="0.544" stopColor="#9B1A4D"/><stop offset="0.825" stopColor="#620F30"/><stop offset="0.994" stopColor="#3D081E"/></linearGradient>
          <linearGradient id="ff-g" x1="-1.397" x2="19.87" y1="1.383" y2="15.511" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.114" stopColor="#DE286E"/><stop offset="0.303" stopColor="#C52361"/><stop offset="0.544" stopColor="#9B1A4D"/><stop offset="0.825" stopColor="#620F30"/><stop offset="0.994" stopColor="#3D081E"/></linearGradient>
          <linearGradient id="ff-h" x1="-464.769" x2="-461.125" y1="461.172" y2="489.944" gradientUnits="userSpaceOnUse"><stop stopColor="#E82A73"/><stop offset="0.114" stopColor="#DE286E"/><stop offset="0.303" stopColor="#C52361"/><stop offset="0.544" stopColor="#9B1A4D"/><stop offset="0.825" stopColor="#620F30"/><stop offset="0.994" stopColor="#3D081E"/></linearGradient>
        </defs>
      </svg>
    ),
  }

  return (
    <span className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity" title={type}>
      {icons[type]}
    </span>
  )
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  'TODO': { bg: 'bg-zinc-500/20 dark:bg-zinc-600/30', text: 'text-zinc-700 dark:text-zinc-300' },
  'In Progress': { bg: 'bg-yellow-500/20 dark:bg-yellow-500/20', text: 'text-yellow-800 dark:text-yellow-400' },
  'In Review': { bg: 'bg-blue-500/20 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
  'Done': { bg: 'bg-green-500/20 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-400' },
}

const PRIORITY_COLORS: Record<number, { label: string; badge: string }> = {
  0: { label: 'None', badge: 'bg-zinc-500/15 text-zinc-600 dark:bg-zinc-600/20 dark:text-zinc-400' },
  1: { label: 'Urgent', badge: 'bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  2: { label: 'High', badge: 'bg-orange-500/20 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
  3: { label: 'Medium', badge: 'bg-yellow-500/20 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400' },
  4: { label: 'Low', badge: 'bg-zinc-500/15 text-zinc-600 dark:bg-zinc-600/20 dark:text-zinc-400' },
}

export default function TaskCard({ rec, active, onClick, index }: TaskCardProps) {
  const statusStyle = STATUS_COLORS[rec.stateName] || STATUS_COLORS['TODO']
  const priorityInfo = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS[0]

  return (
    <div
      onClick={onClick}
      className={cn(
        'animate-card-enter group relative flex gap-3 rounded-lg p-3 cursor-pointer transition-all duration-150',
        active
          ? 'bg-muted/70 ring-1 ring-ring/20'
          : 'hover:bg-muted/50'
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Rank */}
      <div className="shrink-0 w-5 pt-0.5">
        <span className="text-[15px] font-semibold tabular-nums text-muted-foreground/50 font-mono">
          {rec.rank}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Row 1: ID + status badge + priority badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-secondary-foreground/60 font-mono tracking-tight">
            {rec.identifier}
          </span>
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-sm uppercase tracking-wide',
            statusStyle.bg, statusStyle.text
          )}>
            {rec.stateName.toUpperCase()}
          </span>
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-sm tracking-wide',
            priorityInfo.badge
          )}>
            {priorityInfo.label}
          </span>
        </div>

        {/* Row 2: Title */}
        <div className="text-[14px] font-medium text-foreground leading-snug line-clamp-2">
          {rec.title}
        </div>

        {/* Row 3: Agent reasoning */}
        <div className="text-[12px] text-muted-foreground/70 leading-relaxed line-clamp-2">
          {rec.reasoning}
        </div>

        {/* Row 4: Source icons */}
        <div className="flex items-center gap-2.5 pt-0.5">
          {rec.sources.map(s => (
            <SourceIcon key={s} type={s} />
          ))}
        </div>
      </div>
    </div>
  )
}
