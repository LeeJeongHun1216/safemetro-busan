import type { StationSummary } from '@/types/elevator'
import { STATUS_COLORS, STATUS_LABELS, LINE_COLORS } from '@/utils/statusColors'

interface StationDetailCardProps {
  station: StationSummary
  onClose: () => void
}

export function StationDetailCard({ station, onClose }: StationDetailCardProps) {
  const avgComplexity =
    station.elevators.reduce((a, e) => a + e.complexityScore, 0) /
    station.elevators.length

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 mx-auto w-full max-w-[280px] animate-slide-up rounded-xl border border-slate-100 bg-white p-3 shadow-panel sm:max-w-xs lg:bottom-4 lg:left-4 lg:max-w-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900">
              {station.stationName}역
            </h3>
            <span
              className="rounded px-1 py-0.5 text-[9px] font-bold text-white"
              style={{ backgroundColor: LINE_COLORS[station.lineNumber] }}
            >
              {station.lineNumber}호선
            </span>
            {station.isTransferStation && (
              <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-600">
                환승
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[station.status] }}
            />
            <span className="text-[10px] font-medium text-slate-600">
              {STATUS_LABELS[station.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1 text-sm text-slate-400 hover:bg-slate-100"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[9px]">
        <div className="rounded-md bg-red-50 py-1.5 text-red-600">
          고장 <strong className="text-xs">{station.brokenCount}</strong>
        </div>
        <div className="rounded-md bg-orange-50 py-1.5 text-orange-600">
          부분 <strong className="text-xs">{station.partialCount}</strong>
        </div>
        <div className="rounded-md bg-green-50 py-1.5 text-green-600">
          정상 <strong className="text-xs">{station.normalCount}</strong>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        복잡도 <strong className="text-slate-700">{avgComplexity.toFixed(1)}</strong>
      </p>

      <ul className="mt-1.5 max-h-24 space-y-1 overflow-y-auto">
        {station.elevators.slice(0, 3).map((elv) => (
          <li
            key={elv.elevatorId}
            className="rounded-md bg-slate-50 px-2 py-1 text-[9px] leading-snug"
          >
            <span className="font-semibold text-slate-800">
              {elv.elevatorInternalNo}호기
            </span>
            <span className="text-slate-600"> · {elv.learningLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
