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
    <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto w-full max-w-sm animate-slide-up rounded-2xl border border-slate-100 bg-white p-4 shadow-panel sm:max-w-md lg:bottom-5 lg:left-5 lg:right-5 lg:max-w-lg lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 lg:text-lg">
              {station.stationName}역
            </h3>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white lg:text-xs"
              style={{ backgroundColor: LINE_COLORS[station.lineNumber] }}
            >
              {station.lineNumber}호선
            </span>
            {station.isTransferStation && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 lg:text-xs">
                환승역
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full lg:h-2.5 lg:w-2.5"
              style={{ backgroundColor: STATUS_COLORS[station.status] }}
            />
            <span className="text-xs font-medium text-slate-600 lg:text-sm">
              {STATUS_LABELS[station.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-lg text-slate-400 hover:bg-slate-100"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] lg:text-xs">
        <div className="rounded-lg bg-red-50 py-2 text-red-600">
          고장 <strong className="text-sm lg:text-base">{station.brokenCount}</strong>
        </div>
        <div className="rounded-lg bg-orange-50 py-2 text-orange-600">
          부분 <strong className="text-sm lg:text-base">{station.partialCount}</strong>
        </div>
        <div className="rounded-lg bg-green-50 py-2 text-green-600">
          정상 <strong className="text-sm lg:text-base">{station.normalCount}</strong>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500 lg:text-sm">
        경로 복잡도 평균:{' '}
        <strong className="text-slate-800">{avgComplexity.toFixed(1)}</strong>
      </p>

      <ul className="mt-2 max-h-32 space-y-1.5 overflow-y-auto lg:max-h-40">
        {station.elevators.slice(0, 5).map((elv) => (
          <li
            key={elv.elevatorId}
            className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] lg:text-xs"
          >
            <span className="font-semibold text-slate-800">
              {elv.elevatorInternalNo}호기
            </span>
            <span className="text-slate-600"> · {elv.learningLabel}</span>
            {elv.alternativeRoute && (
              <p className="mt-0.5 text-[10px] text-primary-600 lg:text-xs">
                대체: {elv.alternativeRoute}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
