import type { ElevatorRecord } from '@/types/elevator'

export function normalizeDisplayText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

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

/** API에 출발·도착이 뒤바뀐 동일 경로 행 통합용 */
export function movementPathDedupeKey(elv: ElevatorRecord): string {
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
  return [from, to].sort().join('↔')
}

export function formatRouteAvailableLabel(available: boolean): string {
  return available ? '이용 가능' : '이용 불가'
}

export function formatMoveDirection(direction: string): string {
  const d = normalizeDisplayText(direction)
  return d || '-'
}

/** 역 카드·상세용 대체 경로 문구 */
export function formatAlternativeRouteLine(elv: ElevatorRecord): string | null {
  const alt = normalizeDisplayText(elv.alternativeRoute)
  if (!alt) return null
  return `대체 경로 : ${alt}`
}

/** 카드·목록 중복 판별 */
export function elevatorDedupeKey(elv: ElevatorRecord): string {
  return [
    elv.elevatorInternalNo,
    elv.isRouteAvailable,
    movementPathDedupeKey(elv),
    normalizeDisplayText(elv.moveDirection),
    normalizeDisplayText(elv.alternativeRoute),
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

/** 장애 현황·표시용 중복 행 판별 (양방향 경로·동일 안내 통합) */
export function statusRecordDedupeKey(r: ElevatorRecord): string {
  const routeHint =
    normalizeDisplayText(r.alternativeRoute) ||
    normalizeDisplayText(r.learningLabel)

  return [
    r.stationName,
    r.lineNumber,
    r.elevatorInternalNo,
    r.status,
    r.isRouteAvailable,
    movementPathDedupeKey(r),
    normalizeDisplayText(r.moveDirection),
    routeHint,
    r.complexityGrade,
    String(r.complexityScore),
  ].join('|')
}

export function getDistinctStatusRecords(
  records: ElevatorRecord[]
): ElevatorRecord[] {
  const seen = new Set<string>()
  const result: ElevatorRecord[] = []

  for (const r of records) {
    const key = statusRecordDedupeKey(r)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(r)
  }

  return result
}

/** 역별 카드에 보여줄 서로 다른 대체 경로 문구 */
export function getDistinctAlternativeRouteLines(
  elevators: ElevatorRecord[],
  limit = 3
): string[] {
  const seen = new Set<string>()
  const lines: string[] = []

  for (const elv of getDistinctElevatorEntries(elevators, elevators.length)) {
    const line = formatAlternativeRouteLine(elv)
    if (!line || seen.has(line)) continue
    seen.add(line)
    lines.push(line)
    if (lines.length >= limit) break
  }

  return lines
}
