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
    <div className="station-detail-card animate-slide-up">
      <div className="flex items-start justify-between gap-[clamp(0.35rem,1.5cqw,0.75rem)]">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-[clamp(0.25rem,1.2cqw,0.5rem)]">
            <h3 className="station-detail-card__title font-bold text-slate-900">
              {station.stationName}역
            </h3>
            <span
              className="station-detail-card__badge rounded px-[clamp(0.2rem,0.8cqw,0.4rem)] py-0.5 font-bold text-white"
              style={{ backgroundColor: LINE_COLORS[station.lineNumber] }}
            >
              {station.lineNumber}호선
            </span>
            {station.isTransferStation && (
              <span className="station-detail-card__badge rounded bg-slate-100 px-[clamp(0.2rem,0.8cqw,0.4rem)] py-0.5 font-medium text-slate-600">
                환승역
              </span>
            )}
          </div>
          <div className="mt-[clamp(0.25rem,1cqw,0.5rem)] flex items-center gap-1.5">
            <span
              className="rounded-full"
              style={{
                backgroundColor: STATUS_COLORS[station.status],
                width: 'clamp(6px, 1.8cqw, 10px)',
                height: 'clamp(6px, 1.8cqw, 10px)',
              }}
            />
            <span className="station-detail-card__badge font-medium text-slate-600">
              {STATUS_LABELS[station.status]}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-[clamp(0.2rem,1cqw,0.4rem)] text-[clamp(0.85rem,3.5cqw,1.1rem)] text-slate-400 hover:bg-slate-100"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      <div className="station-detail-card__stats mt-[clamp(0.4rem,2cqw,0.85rem)] grid grid-cols-3 gap-[clamp(0.25rem,1.2cqw,0.5rem)] text-center">
        <div className="rounded-lg bg-red-50 py-[clamp(0.35rem,1.5cqw,0.65rem)] text-red-600">
          고장 <strong>{station.brokenCount}</strong>
        </div>
        <div className="rounded-lg bg-orange-50 py-[clamp(0.35rem,1.5cqw,0.65rem)] text-orange-600">
          부분 <strong>{station.partialCount}</strong>
        </div>
        <div className="rounded-lg bg-green-50 py-[clamp(0.35rem,1.5cqw,0.65rem)] text-green-600">
          정상 <strong>{station.normalCount}</strong>
        </div>
      </div>

      <p className="mt-[clamp(0.35rem,1.5cqw,0.65rem)] text-slate-500">
        경로 복잡도 평균:{' '}
        <strong className="text-slate-800">{avgComplexity.toFixed(1)}</strong>
      </p>

      <ul className="station-detail-card__list mt-[clamp(0.25rem,1.2cqw,0.5rem)] space-y-[clamp(0.2rem,0.8cqw,0.35rem)]">
        {station.elevators.slice(0, 5).map((elv) => (
          <li
            key={elv.elevatorId}
            className="station-detail-card__list-item rounded-lg bg-slate-50 leading-snug"
          >
            <span className="font-semibold text-slate-800">
              {elv.elevatorInternalNo}호기
            </span>
            <span className="text-slate-600"> · {elv.learningLabel}</span>
            {elv.alternativeRoute && (
              <p className="mt-0.5 text-primary-600">대체: {elv.alternativeRoute}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
