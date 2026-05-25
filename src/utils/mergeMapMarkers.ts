import { resolveStationCoords } from '@/utils/stationMapMarker'
import type { ElevatorStatus, StationSummary } from '@/types/elevator'

/** 환승역 등 동일 좌표(약 130m 이내) 마커를 하나로 합침 */
const SAME_LOCATION_THRESHOLD = 0.0012

function worstStatus(statuses: ElevatorStatus[]): ElevatorStatus {
  if (statuses.includes('broken')) return 'broken'
  if (statuses.includes('partial')) return 'partial'
  return 'normal'
}

function mergeStationGroup(group: StationSummary[]): StationSummary {
  if (group.length === 1) return group[0]

  const sorted = [...group].sort((a, b) => a.lineNumber - b.lineNumber)
  const primary = sorted[0]
  const elevators = sorted.flatMap((s) => s.elevators)

  return {
    ...primary,
    isTransferStation: sorted.some((s) => s.isTransferStation),
    elevators,
    status: worstStatus(sorted.map((s) => s.status)),
    brokenCount: elevators.filter((e) => e.status === 'broken').length,
    partialCount: elevators.filter((e) => e.status === 'partial').length,
    normalCount: elevators.filter((e) => e.status === 'normal').length,
  }
}

export function mergeStationsAtSameLocation(
  stations: Iterable<StationSummary>
): StationSummary[] {
  const list = [...stations]
  const groups: StationSummary[][] = []

  for (const station of list) {
    const coords = resolveStationCoords(station.latitude, station.longitude)
    if (!coords) continue

    let group = groups.find((g) => {
      const gc = resolveStationCoords(g[0].latitude, g[0].longitude)
      if (!gc) return false
      return (
        Math.abs(gc.latitude - coords.latitude) < SAME_LOCATION_THRESHOLD &&
        Math.abs(gc.longitude - coords.longitude) < SAME_LOCATION_THRESHOLD
      )
    })

    if (!group) {
      group = []
      groups.push(group)
    }
    group.push(station)
  }

  return groups.map(mergeStationGroup)
}
