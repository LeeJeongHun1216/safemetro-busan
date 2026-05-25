import { resolveStationCoords } from '@/utils/stationMapMarker'
import { getLineColor } from '@/utils/statusColors'
import type { MetroGraph } from '@/utils/metroGraph'
import type { StationSummary } from '@/types/elevator'

export interface RouteMapSegment {
  path: { lat: number; lng: number }[]
  lineNumber: number
  color: string
}

function getStationCoords(
  stations: StationSummary[],
  name: string
): { lat: number; lng: number } | null {
  const st = stations.find((s) => s.stationName === name)
  if (!st) return null
  const c = resolveStationCoords(st.latitude, st.longitude)
  if (!c) return null
  return { lat: c.latitude, lng: c.longitude }
}

/** 지도 polyline용 구간별 좌표·호선 색 */
export function buildRouteMapSegments(
  pathStationNames: string[],
  stations: StationSummary[],
  graph: MetroGraph
): RouteMapSegment[] {
  const segments: RouteMapSegment[] = []

  for (let i = 0; i < pathStationNames.length - 1; i++) {
    const fromName = pathStationNames[i]
    const toName = pathStationNames[i + 1]
    const from = getStationCoords(stations, fromName)
    const to = getStationCoords(stations, toName)
    if (!from || !to) continue

    const line =
      graph[toName]?.line ??
      stations.find((s) => s.stationName === toName)?.lineNumber ??
      1

    segments.push({
      path: [from, to],
      lineNumber: line,
      color: getLineColor(line),
    })
  }

  return segments
}

export function collectPathBounds(
  pathStationNames: string[],
  stations: StationSummary[]
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = []
  for (const name of pathStationNames) {
    const c = getStationCoords(stations, name)
    if (c) points.push(c)
  }
  return points
}
