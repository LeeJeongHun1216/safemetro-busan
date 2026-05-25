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
    <div className="absolute bottom-4 left-4 right-4 z-20 mx-auto w-full max-w-md animate-slide-up rounded-2xl border border-slate-100 bg-white p-5 shadow-panel lg:bottom-6 lg:left-6 lg:right-6 lg:max-w-2xl lg:p-6 xl:max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 lg:text-xl">
              {station.stationName}역
            </h3>
            <span
              className="rounded px-2 py-0.5 text-xs font-bold text-white lg:text-sm"
              style={{ backgroundColor: LINE_COLORS[station.lineNumber] }}
            >
              {station.lineNumber}호선
            </span>
            {station.isTransferStation && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                환승역
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full lg:h-3 lg:w-3"
              style={{ backgroundColor: STATUS_COLORS[station.status] }}
            />
            <span className="text-sm font-medium text-slate-600 lg:text-base">
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

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs lg:gap-3 lg:text-sm">
        <div className="rounded-lg bg-red-50 py-2.5 text-red-600 lg:py-3">
          고장 <strong className="text-base lg:text-lg">{station.brokenCount}</strong>
        </div>
        <div className="rounded-lg bg-orange-50 py-2.5 text-orange-600 lg:py-3">
          부분 <strong className="text-base lg:text-lg">{station.partialCount}</strong>
        </div>
        <div className="rounded-lg bg-green-50 py-2.5 text-green-600 lg:py-3">
          정상 <strong className="text-base lg:text-lg">{station.normalCount}</strong>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 lg:text-base">
        경로 복잡도 평균:{' '}
        <strong className="text-slate-800">{avgComplexity.toFixed(1)}</strong>
      </p>

      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto lg:max-h-56">
        {station.elevators.slice(0, 6).map((elv) => (
          <li
            key={elv.elevatorId}
            className="rounded-lg bg-slate-50 px-3 py-2 text-xs lg:text-sm"
          >
            <span className="font-semibold text-slate-800">
              {elv.elevatorInternalNo}호기
            </span>
            <span className="text-slate-600"> · {elv.learningLabel}</span>
            {elv.alternativeRoute && (
              <p className="mt-1 text-sm text-primary-600 lg:text-base">
                대체: {elv.alternativeRoute}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
