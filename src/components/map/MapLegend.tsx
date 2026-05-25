import { STATUS_COLORS, STATUS_LABELS } from '@/utils/statusColors'
import type { ElevatorStatus } from '@/types/elevator'

const ITEMS: ElevatorStatus[] = ['normal', 'partial', 'broken']

export function MapLegend() {
  return (
    <div className="absolute left-1/2 top-2 z-10 flex w-max max-w-[calc(100%-1rem)] -translate-x-1/2 flex-nowrap items-center justify-center gap-2 rounded-full border border-slate-100 bg-white/95 px-2.5 py-1.5 shadow-card backdrop-blur-sm sm:top-3 sm:gap-3 sm:px-4 sm:py-2">
      {ITEMS.map((status) => (
        <div
          key={status}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap"
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full sm:h-2.5 sm:w-2.5"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          />
          <span className="text-[10px] font-medium leading-none text-slate-600 sm:text-xs">
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  )
}
