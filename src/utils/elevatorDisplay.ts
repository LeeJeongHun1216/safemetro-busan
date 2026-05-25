import type { ElevatorRecord } from '@/types/elevator'

export function formatZoneFloor(
  zone: string,
  floor: string,
  floorLevel: number
): string {
  const place = [zone, floor].filter(Boolean).join(' ').trim()
  if (!place) return '-'
  return `${place} (${floorLevel}층)`
}

/** 출발 → 도착 이동 구간 (공공데이터 출발/도착 구분·층) */
export function formatMovementPath(elv: ElevatorRecord): string {
  const from = formatZoneFloor(
    elv.departureZone,
    elv.departureFloor,
    elv.departureFloorLevel
  )
  const to = formatZoneFloor(
    elv.arrivalZone,
    elv.arrivalFloor,
    elv.arrivalFloorLevel
  )
  return `${from} → ${to}`
}

export function formatRouteAvailableLabel(available: boolean): string {
  return available ? '이용 가능' : '이용 불가'
}

export function formatMoveDirection(direction: string): string {
  const d = direction.trim()
  return d || '-'
}

/** 카드 중복 판별 (1순위 표시 필드 기준) */
export function elevatorDedupeKey(elv: ElevatorRecord): string {
  return [
    elv.elevatorInternalNo,
    elv.isRouteAvailable,
    formatMovementPath(elv),
    elv.moveDirection.trim(),
    elv.alternativeRoute.trim(),
  ].join('|')
}

/** 동일 안내 문구는 한 번만 표시 */
export function getDistinctElevatorEntries(
  elevators: ElevatorRecord[],
  limit = 5
): ElevatorRecord[] {
  const seen = new Set<string>()
  const result: ElevatorRecord[] = []

  for (const elv of elevators) {
    const key = elevatorDedupeKey(elv)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(elv)
    if (result.length >= limit) break
  }

  return result
}
