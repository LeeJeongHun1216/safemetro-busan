import type { ElevatorRecord } from '@/types/elevator'
import {
  formatAlternativeRouteLine,
  formatMovementPath,
  formatMoveDirection,
  formatRouteAvailableLabel,
} from '@/utils/elevatorDisplay'

interface ElevatorRouteDetailProps {
  elevator: ElevatorRecord
}

export function ElevatorRouteDetail({ elevator }: ElevatorRouteDetailProps) {
  const routeLabel = formatRouteAvailableLabel(elevator.isRouteAvailable)
  const altRouteLine = formatAlternativeRouteLine(elevator)

  return (
    <div className="station-detail-card__list-item rounded-lg border border-slate-100 bg-slate-50 p-[clamp(0.45rem,1.6cqw,0.65rem)] leading-snug">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-semibold text-slate-900">
          {elevator.elevatorInternalNo}호기
        </span>
        <span
          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
            elevator.isRouteAvailable
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {routeLabel}
        </span>
        <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
          {formatMoveDirection(elevator.moveDirection)}
        </span>
      </div>

      <p className="mt-1 text-[10px] text-slate-700">
        <span className="font-medium text-slate-500">이동 </span>
        {formatMovementPath(elevator)}
      </p>

      {altRouteLine ? (
        <p className="mt-1 text-[10px] font-medium text-primary-700">
          {altRouteLine}
        </p>
      ) : (
        <p className="mt-1 text-[10px] text-slate-400">대체 경로 정보 없음</p>
      )}
    </div>
  )
}
