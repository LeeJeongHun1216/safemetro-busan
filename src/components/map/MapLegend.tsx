import { STATUS_COLORS, STATUS_LABELS } from '@/utils/statusColors'
import type { ElevatorStatus } from '@/types/elevator'

const ITEMS: ElevatorStatus[] = ['normal', 'partial', 'broken']

export function MapLegend() {
  return (
    <div className="absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full border border-slate-100 bg-white/95 px-4 py-2 shadow-card backdrop-blur-sm">
      {ITEMS.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          />
          <span className="text-xs font-medium text-slate-600">
            {STATUS_LABELS[status]}
          </span>
        </div>
      ))}
    </div>
  )
}
