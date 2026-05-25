import type { StationSummary } from '@/types/elevator'

export interface MetroNode {
  line: number
  neighbors: string[]
}

export type MetroGraph = Record<string, MetroNode>

const COORD_THRESHOLD = 0.008

function coordKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)}_${lng.toFixed(4)}`
}

/** API 역 데이터로 호선 순서·환승역 기반 인접 그래프 생성 */
export function buildMetroGraphFromStations(
  stations: StationSummary[]
): MetroGraph {
  const graph: MetroGraph = {}
  const byLine = new Map<number, StationSummary[]>()
  const byCoord = new Map<string, string[]>()

  for (const station of stations) {
    if (!graph[station.stationName]) {
      graph[station.stationName] = {
        line: station.lineNumber,
        neighbors: [],
      }
    }

    const list = byLine.get(station.lineNumber) ?? []
    if (!list.some((s) => s.stationName === station.stationName)) {
      list.push(station)
    }
    byLine.set(station.lineNumber, list)

    const key = coordKey(station.latitude, station.longitude)
    const names = byCoord.get(key) ?? []
    if (!names.includes(station.stationName)) names.push(station.stationName)
    byCoord.set(key, names)
  }

  function link(a: string, b: string) {
    if (a === b) return
    const nodeA = graph[a]
    const nodeB = graph[b]
    if (!nodeA || !nodeB) return
    if (!nodeA.neighbors.includes(b)) nodeA.neighbors.push(b)
    if (!nodeB.neighbors.includes(a)) nodeB.neighbors.push(a)
  }

  for (const [, lineStations] of byLine) {
    const sorted = [...lineStations].sort((a, b) => a.stationNo - b.stationNo)
    for (let i = 0; i < sorted.length - 1; i++) {
      link(sorted[i].stationName, sorted[i + 1].stationName)
    }
  }

  for (const station of stations) {
    for (const other of stations) {
      if (station.stationName === other.stationName) continue
      const latDiff = Math.abs(station.latitude - other.latitude)
      const lngDiff = Math.abs(station.longitude - other.longitude)
      if (latDiff < COORD_THRESHOLD && lngDiff < COORD_THRESHOLD) {
        link(station.stationName, other.stationName)
      }
    }
  }

  for (const names of byCoord.values()) {
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        link(names[i], names[j])
      }
    }
  }

  return graph
}

export function bfsShortestPath(
  graph: MetroGraph,
  from: string,
  to: string
): string[] | null {
  if (from === to) return [from]
  if (!graph[from] || !graph[to]) return null

  const queue: string[][] = [[from]]
  const visited = new Set<string>([from])

  while (queue.length > 0) {
    const path = queue.shift()!
    const last = path[path.length - 1]
    const node = graph[last]
    if (!node) continue

    for (const next of node.neighbors) {
      if (visited.has(next)) continue
      visited.add(next)
      const newPath = [...path, next]
      if (next === to) return newPath
      queue.push(newPath)
    }
  }

  return null
}

/** 역별 가중치를 반영한 접근성 우선 최단 경로 */
export function dijkstraWeightedPath(
  graph: MetroGraph,
  from: string,
  to: string,
  nodeWeight: (name: string) => number
): string[] | null {
  if (from === to) return [from]
  if (!graph[from] || !graph[to]) return null

  const dist = new Map<string, number>()
  const prev = new Map<string, string | null>()
  const visited = new Set<string>()

  dist.set(from, nodeWeight(from))
  prev.set(from, null)

  while (visited.size < Object.keys(graph).length) {
    let u: string | null = null
    let best = Infinity
    for (const [name, d] of dist) {
      if (visited.has(name) || d >= best) continue
      best = d
      u = name
    }
    if (u === null) break
    if (u === to) break
    visited.add(u)

    const node = graph[u]
    if (!node) continue

    for (const v of node.neighbors) {
      if (visited.has(v)) continue
      const alt = best + 1 + nodeWeight(v)
      if (!dist.has(v) || alt < dist.get(v)!) {
        dist.set(v, alt)
        prev.set(v, u)
      }
    }
  }

  if (!prev.has(to)) return null

  const path: string[] = []
  let cur: string | null = to
  while (cur) {
    path.unshift(cur)
    cur = prev.get(cur) ?? null
  }
  return path
}
