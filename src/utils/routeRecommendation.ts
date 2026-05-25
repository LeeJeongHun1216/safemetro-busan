import type {
  UserType,
  RouteRecommendation,
  RouteStep,
  StationSummary,
} from '@/types/elevator'
import {
  buildMetroGraphFromStations,
  bfsShortestPath,
  type MetroGraph,
} from '@/utils/metroGraph'

/** 정거장 1개 구간 기본 이동 시간(분) */
const MINUTES_PER_STATION = 2

const USER_WEIGHTS: Record<
  UserType,
  { elevator: number; transfer: number; complexity: number; time: number }
> = {
  wheelchair: { elevator: 3, transfer: 2, complexity: 2.5, time: 1 },
  elderly: { elevator: 1.5, transfer: 3, complexity: 1, time: 2 },
  stroller: { elevator: 2, transfer: 2, complexity: 1.5, time: 1.5 },
  general: { elevator: 1, transfer: 1, complexity: 0.5, time: 2 },
}

function getStation(
  stations: StationSummary[],
  name: string
): StationSummary | undefined {
  return stations.find((s) => s.stationName === name)
}

function stationScore(
  station: StationSummary | undefined,
  userType: UserType
): number {
  if (!station) return 0
  const w = USER_WEIGHTS[userType]
  let score = 5
  if (station.status === 'broken') score -= 2 * w.elevator
  if (station.status === 'partial') score -= 1 * w.elevator
  const avgComplexity =
    station.elevators.reduce((a, e) => a + e.complexityScore, 0) /
    station.elevators.length
  score -= avgComplexity * 0.3 * w.complexity
  if (station.isTransferStation) score -= 0.3 * w.transfer
  return Math.max(0, Math.min(5, score))
}

function countTransfers(path: string[], graph: MetroGraph): number {
  let transfers = 0
  for (let i = 1; i < path.length; i++) {
    const prevLine = graph[path[i - 1]]?.line
    const currLine = graph[path[i]]?.line
    if (prevLine && currLine && prevLine !== currLine) transfers++
  }
  return transfers
}

function estimateMinutes(
  path: string[],
  stations: StationSummary[],
  userType: UserType,
  graph: MetroGraph
): number {
  const w = USER_WEIGHTS[userType]
  let minutes = (path.length - 1) * MINUTES_PER_STATION

  for (const name of path) {
    const st = getStation(stations, name)
    if (!st) continue
    minutes += st.elevators.length > 0 ? 1.5 * w.elevator : 2
    if (st.status === 'broken') minutes += 3
    if (st.status === 'partial') minutes += 1.5
  }

  minutes += countTransfers(path, graph) * (3 * w.transfer)
  return Math.round(minutes)
}

function buildSteps(
  path: string[],
  stations: StationSummary[],
  graph: MetroGraph
): RouteStep[] {
  const steps: RouteStep[] = []
  let stepId = 0

  for (let i = 0; i < path.length; i++) {
    const name = path[i]
    const st = getStation(stations, name)
    const line = graph[name]?.line ?? st?.lineNumber

    if (i === 0) {
      const brokenElv = st?.elevators.find((e) => e.status === 'broken')
      const altElv = st?.elevators.find(
        (e) => e.isRouteAvailable && e.status !== 'broken'
      )
      steps.push({
        id: String(stepId++),
        type: 'station',
        title: `${name}역${line ? ` (${line}호선)` : ''}`,
        alert: brokenElv
          ? { level: 'warning', message: brokenElv.learningLabel }
          : undefined,
        subSteps: altElv
          ? [
              `${altElv.elevatorInternalNo}번 엘리베이터 이용 (${altElv.departureFloor} → ${altElv.arrivalFloor}) 약 1분`,
              '승강장 이동 약 2분',
            ]
          : ['역 진입 및 승강장 이동 약 3분'],
        lineNumber: line,
      })
      continue
    }

    const prevLine = graph[path[i - 1]]?.line
    const currLine = line
    const isTransfer = prevLine !== currLine

    if (isTransfer) {
      const transferElv = st?.elevators.find((e) => e.isRouteAvailable)
      steps.push({
        id: String(stepId++),
        type: 'transfer',
        title: `${name}역 환승 (${currLine}호선)`,
        durationMinutes: 2,
        alert: transferElv
          ? {
              level: 'success',
              message: `${transferElv.elevatorInternalNo}번 엘리베이터 이용 가능`,
            }
          : undefined,
        subSteps: ['약 2분 (환승 이동)'],
        lineNumber: currLine,
      })
    } else if (i < path.length - 1) {
      const next = path[i + 1]
      const direction = getDirectionLabel(next)
      steps.push({
        id: String(stepId++),
        type: 'ride',
        title: `${currLine}호선 탑승 (${direction})`,
        durationMinutes: MINUTES_PER_STATION,
        lineNumber: currLine,
      })
    }

    if (i === path.length - 1) {
      steps.push({
        id: String(stepId++),
        type: 'arrival',
        title: `${name}역 도착`,
        lineNumber: line,
      })
    }
  }

  return steps
}

function getDirectionLabel(to: string): string {
  return `${to} 방면`
}

function convenienceScore(
  path: string[],
  stations: StationSummary[],
  userType: UserType,
  graph: MetroGraph
): number {
  const scores = path.map((n) => stationScore(getStation(stations, n), userType))
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const transferPenalty = countTransfers(path, graph) * 0.25
  return Math.round((avg - transferPenalty) * 10) / 10
}

function aiInsight(userType: UserType): string {
  const map: Record<UserType, string> = {
    wheelchair:
      '추천 경로. 현재 엘리베이터 상태를 고려했을 때 이동 편의성이 가장 높은 경로입니다.',
    elderly: '추천 경로. 환승 횟수와 이동 시간을 최소화한 경로입니다.',
    stroller: '추천 경로. 엘리베이터·왜곡 경로가 적은 유모차 친화 경로입니다.',
    general: '추천 경로. 전체적으로 가장 효율적인 이동 경로입니다.',
  }
  return map[userType]
}

function aiSummary(
  path: string[],
  stations: StationSummary[],
  userType: UserType,
  graph: MetroGraph
): string {
  const transfers = countTransfers(path, graph)
  const hasBroken = path.some(
    (n) => getStation(stations, n)?.status === 'broken'
  )

  if (userType === 'wheelchair') {
    if (hasBroken) {
      return '일부 구간에 엘리베이터 고장이 있으나, 대체 엘리베이터 경로를 포함하여 휠체어 사용자에게 가장 편리한 경로로 분석되었습니다.'
    }
    return '현재 경로는 엘리베이터 이용이 가능하며, 환승 이동 거리가 짧아 휠체어 사용자에게 가장 편리한 경로입니다.'
  }
  if (userType === 'elderly') {
    return `환승 ${transfers}회로 노약자 이동 부담을 줄였으며, 복잡도가 낮은 역 위주로 경로를 구성했습니다.`
  }
  return `AI가 ${path.length}개 역을 분석하여 이동 편의성과 소요 시간의 균형을 맞춘 최적 경로를 제안합니다.`
}

export function recommendRoute(
  departure: string,
  arrival: string,
  userType: UserType,
  stations: StationSummary[]
): RouteRecommendation | null {
  const from = departure.replace(/역$/, '')
  const to = arrival.replace(/역$/, '')

  const graph = buildMetroGraphFromStations(stations)
  const path = bfsShortestPath(graph, from, to)
  if (!path) return null

  const transfers = countTransfers(path, graph)
  const minutes = estimateMinutes(path, stations, userType, graph)
  const score = convenienceScore(path, stations, userType, graph)

  return {
    departureStation: from,
    arrivalStation: to,
    estimatedMinutes: minutes,
    transferCount: transfers,
    convenienceScore: Math.min(5, Math.max(3.5, score)),
    aiInsight: aiInsight(userType),
    aiSummary: aiSummary(path, stations, userType, graph),
    steps: buildSteps(path, stations, graph),
    pathStationNames: path,
  }
}

export function getStationNames(stations: StationSummary[]): string[] {
  const names = new Set(stations.map((s) => s.stationName))
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'ko'))
}
