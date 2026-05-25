import type {
  UserType,
  RouteRecommendation,
  RouteComparisonResult,
  RouteStep,
  StationSummary,
} from '@/types/elevator'
import {
  buildMetroGraphFromStations,
  bfsShortestPath,
  dijkstraWeightedPath,
  type MetroGraph,
} from '@/utils/metroGraph'

/** 같은 호선 인접 역 간 열차 이동(분) */
const MINUTES_PER_HOP = 1.5
/** 환승 1회(도보·대기) */
const MINUTES_PER_TRANSFER = 4
/** 출발·도착 역 진입·퇴장(각) */
const MINUTES_STATION_ACCESS = 2

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

function nodeWeight(
  name: string,
  stations: StationSummary[],
  userType: UserType
): number {
  const st = getStation(stations, name)
  if (!st) return 1
  const w = USER_WEIGHTS[userType]
  let cost = 0.5
  if (st.status === 'broken') cost += 3 * w.elevator
  else if (st.status === 'partial') cost += 1.2 * w.elevator
  const avgComplexity =
    st.elevators.reduce((a, e) => a + e.complexityScore, 0) /
    Math.max(1, st.elevators.length)
  cost += avgComplexity * 0.15 * w.complexity
  if (st.isTransferStation) cost += 0.4 * w.transfer
  return cost
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

function countBrokenOnPath(path: string[], stations: StationSummary[]): number {
  return path.filter((n) => getStation(stations, n)?.status === 'broken').length
}

function countPartialOnPath(path: string[], stations: StationSummary[]): number {
  return path.filter((n) => getStation(stations, n)?.status === 'partial').length
}

function estimateMinutes(
  path: string[],
  stations: StationSummary[],
  userType: UserType,
  graph: MetroGraph
): number {
  if (path.length < 2) return 0

  const w = USER_WEIGHTS[userType]
  let minutes = MINUTES_STATION_ACCESS * 2

  for (let i = 1; i < path.length; i++) {
    const prevLine = graph[path[i - 1]]?.line
    const currLine = graph[path[i]]?.line
    if (prevLine && currLine && prevLine === currLine) {
      minutes += MINUTES_PER_HOP
    }
  }

  minutes += countTransfers(path, graph) * MINUTES_PER_TRANSFER

  for (const name of path) {
    const st = getStation(stations, name)
    if (!st) continue
    if (st.status === 'broken') minutes += 1 * w.elevator
    else if (st.status === 'partial') minutes += 0.5 * w.elevator
  }

  return Math.max(Math.round(minutes), path.length - 1)
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
      const direction = `${next} 방면`
      steps.push({
        id: String(stepId++),
        type: 'ride',
        title: `${currLine}호선 이동 (${direction})`,
        durationMinutes: Math.round(MINUTES_PER_HOP) || 2,
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

function aiInsight(userType: UserType, routeType: 'accessibility' | 'shortest'): string {
  if (routeType === 'shortest') {
    return '역 개수·환승을 최소화한 최단 경로입니다.'
  }
  const map: Record<UserType, string> = {
    wheelchair:
      '엘리베이터 상태·복잡도를 반영한 접근성 우선 경로입니다.',
    elderly: '환승 부담과 엘리베이터 이용을 고려한 경로입니다.',
    stroller: '엘리베이터·왜곡 구간을 줄인 유모차 친화 경로입니다.',
    general: '이동 편의성과 소요 시간의 균형을 맞춘 경로입니다.',
  }
  return map[userType]
}

function aiSummary(
  path: string[],
  stations: StationSummary[],
  userType: UserType,
  graph: MetroGraph,
  routeType: 'accessibility' | 'shortest'
): string {
  const transfers = countTransfers(path, graph)
  const broken = countBrokenOnPath(path, stations)

  if (routeType === 'shortest') {
    return `최단 경로: ${path.length}개 역, 환승 ${transfers}회. 엘리베이터 고장 역 ${broken}곳을 지나갈 수 있습니다.`
  }

  if (userType === 'wheelchair' && broken > 0) {
    return '일부 고장 구간이 있으나 대체 엘리베이터 경로를 우선 반영했습니다.'
  }
  return `접근성 우선: ${path.length}개 역, 환승 ${transfers}회. 엘리베이터·복잡도 가중치를 적용했습니다.`
}

function buildRecommendation(
  path: string[],
  from: string,
  to: string,
  userType: UserType,
  stations: StationSummary[],
  graph: MetroGraph,
  routeType: 'accessibility' | 'shortest'
): RouteRecommendation {
  const transfers = countTransfers(path, graph)
  const minutes = estimateMinutes(path, stations, userType, graph)
  const score = convenienceScore(path, stations, userType, graph)

  return {
    departureStation: from,
    arrivalStation: to,
    estimatedMinutes: minutes,
    transferCount: transfers,
    convenienceScore: Math.min(5, Math.max(3.5, score)),
    aiInsight: aiInsight(userType, routeType),
    aiSummary: aiSummary(path, stations, userType, graph, routeType),
    steps: buildSteps(path, stations, graph),
    pathStationNames: path,
    routeType,
  }
}

function pathsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((n, i) => n === b[i])
}

function buildWhyRecommended(
  recommended: RouteRecommendation,
  shortest: RouteRecommendation,
  stations: StationSummary[],
  userType: UserType
): string[] {
  const reasons: string[] = []
  const recPath = recommended.pathStationNames
  const shortPath = shortest.pathStationNames

  if (pathsEqual(recPath, shortPath)) {
    reasons.push('최단 경로와 접근성 우선 경로가 동일합니다.')
    return reasons
  }

  if (recommended.estimatedMinutes <= shortest.estimatedMinutes) {
    reasons.push(
      `예상 소요 ${recommended.estimatedMinutes}분으로 최단(${shortest.estimatedMinutes}분)과 같거나 더 짧게 안내됩니다.`
    )
  } else {
    reasons.push(
      `최단 경로(${shortest.estimatedMinutes}분)보다 ${recommended.estimatedMinutes - shortest.estimatedMinutes}분 더 걸리지만, 엘리베이터·환승 부담을 줄였습니다.`
    )
  }

  const recBroken = countBrokenOnPath(recPath, stations)
  const shortBroken = countBrokenOnPath(shortPath, stations)
  if (shortBroken > recBroken) {
    reasons.push(
      `최단 경로는 엘리베이터 고장 역 ${shortBroken}곳을 지나지만, 추천 경로는 ${recBroken}곳입니다.`
    )
  }

  const recPartial = countPartialOnPath(recPath, stations)
  const shortPartial = countPartialOnPath(shortPath, stations)
  if (shortPartial > recPartial) {
    reasons.push(
      `일부 장애 역도 최단 경로(${shortPartial}곳)보다 추천 경로(${recPartial}곳)에서 적습니다.`
    )
  }

  if (recommended.transferCount < shortest.transferCount) {
    reasons.push(
      `환승 ${recommended.transferCount}회로, 최단 경로(${shortest.transferCount}회)보다 환승이 적습니다.`
    )
  } else if (recommended.transferCount > shortest.transferCount) {
    reasons.push(
      `환승은 ${recommended.transferCount}회로 최단(${shortest.transferCount}회)보다 많지만, 역별 엘리베이터 상태가 더 양호합니다.`
    )
  }

  if (recommended.convenienceScore > shortest.convenienceScore) {
    reasons.push(
      `이동 편의성 점수 ${recommended.convenienceScore}점 (최단 ${shortest.convenienceScore}점).`
    )
  }

  const userLabel: Record<UserType, string> = {
    wheelchair: '휠체어',
    elderly: '노약자',
    stroller: '유모차',
    general: '일반',
  }
  reasons.push(`${userLabel[userType]} 사용자 유형에 맞춰 역별 가중치를 적용했습니다.`)

  return reasons
}

export function recommendRouteComparison(
  departure: string,
  arrival: string,
  userType: UserType,
  stations: StationSummary[]
): RouteComparisonResult | null {
  const from = departure.replace(/역$/, '')
  const to = arrival.replace(/역$/, '')

  const graph = buildMetroGraphFromStations(stations)
  const shortestPath = bfsShortestPath(graph, from, to)
  if (!shortestPath) return null

  const accessibilityPath =
    dijkstraWeightedPath(graph, from, to, (name) =>
      nodeWeight(name, stations, userType)
    ) ?? shortestPath

  const shortest = buildRecommendation(
    shortestPath,
    from,
    to,
    userType,
    stations,
    graph,
    'shortest'
  )
  const recommended = buildRecommendation(
    accessibilityPath,
    from,
    to,
    userType,
    stations,
    graph,
    'accessibility'
  )

  const pathsAreEqual = pathsEqual(
    recommended.pathStationNames,
    shortest.pathStationNames
  )
  const whyRecommended = buildWhyRecommended(
    recommended,
    shortest,
    stations,
    userType
  )

  const comparisonSummary = pathsAreEqual
    ? '최단·접근성 경로가 동일합니다. 아래 안내를 따르시면 됩니다.'
    : `최단 ${shortest.pathStationNames.length}개 역·환승 ${shortest.transferCount}회 vs 추천 ${recommended.pathStationNames.length}개 역·환승 ${recommended.transferCount}회`

  return {
    recommended,
    shortest,
    pathsAreEqual,
    whyRecommended,
    comparisonSummary,
  }
}

/** @deprecated recommendRouteComparison 사용 권장 */
export function recommendRoute(
  departure: string,
  arrival: string,
  userType: UserType,
  stations: StationSummary[]
): RouteRecommendation | null {
  return (
    recommendRouteComparison(departure, arrival, userType, stations)
      ?.recommended ?? null
  )
}

export function getStationNames(stations: StationSummary[]): string[] {
  const names = new Set(stations.map((s) => s.stationName))
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'ko'))
}
