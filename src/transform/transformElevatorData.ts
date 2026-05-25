import type {
  RawElevatorRecord,
  RawElevatorApiResponse,
  ElevatorRecord,
  StationSummary,
  ElevatorStatus,
  ComplexityGrade,
  AlternativeRouteType,
} from '@/types/elevator'

const YES = 'Y'

const complexityGradeMap: Record<string, ComplexityGrade> = {
  단순: 'simple',
  보통: 'moderate',
  복잡: 'complex',
}

function parseYn(value: string): boolean {
  return value === YES
}

function parseComplexityGrade(grade: string): ComplexityGrade {
  return complexityGradeMap[grade] ?? 'moderate'
}

function parseComplexityScore(
  value: RawElevatorRecord['경로복잡도 점수']
): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function parseAlternativeRouteType(type: string): AlternativeRouteType {
  if (type.includes('이동 불가') || type.includes('이동불가')) {
    return 'ALT_STAIRS'
  }
  const valid: AlternativeRouteType[] = [
    'ALT_ELV',
    'ALT_STAIRS',
    'ALT_ESCALATOR',
    'NORMAL',
  ]
  return valid.includes(type as AlternativeRouteType)
    ? (type as AlternativeRouteType)
    : 'NORMAL'
}

/** 학습라벨·경로 이용 가능 여부·대체경로유형 기반 상태 추론 */
export function deriveElevatorStatus(
  record: RawElevatorRecord
): ElevatorStatus {
  const label = record['학습라벨'] ?? ''
  const altType = record['대체경로유형'] ?? ''
  const available = record['경로 이용 가능 여부'] === YES

  if (
    !available ||
    label.includes('고장') ||
    label.includes('이용 불가') ||
    label.includes('이동불가') ||
    altType.includes('이동 불가') ||
    altType.includes('이동불가')
  ) {
    return 'broken'
  }
  if (
    label.includes('부분') ||
    label.includes('대체') ||
    label.includes('점검') ||
    altType === 'ALT_STAIRS' ||
    altType === 'ALT_ELV'
  ) {
    return 'partial'
  }
  return 'normal'
}

export function transformElevatorRecord(
  raw: RawElevatorRecord
): ElevatorRecord {
  const status = deriveElevatorStatus(raw)

  return {
    isRouteAvailable: parseYn(raw['경로 이용 가능 여부']),
    complexityGrade: parseComplexityGrade(raw['경로복잡도 등급']),
    complexityScore: parseComplexityScore(raw['경로복잡도 점수']),
    alternativeRoute: raw['단계별 대체 경로'],
    alternativeRouteType: parseAlternativeRouteType(raw['대체경로유형']),
    arrivalZone: raw['도착 구분'],
    arrivalFloor: raw['도착층'],
    arrivalFloorLevel: raw['도착층위'],
    platformType: raw['승강장 유형'],
    elevatorId: raw['엘리베이터 고유번호'],
    elevatorInternalNo: raw['엘리베이터 내부 관리번호'],
    longitude: parseFloat(raw['역 경도']),
    latitude: parseFloat(raw['역 위도']),
    stationName: raw['역명'],
    stationNo: raw['역번호'],
    moveDirection: raw['이동방향'],
    isTerminalStation: parseYn(raw['종착역 여부']),
    departureZone: raw['출발 구분'],
    departureFloor: raw['출발층'],
    departureFloorLevel: raw['출발층위'],
    learningLabel: raw['학습라벨'],
    lineNumber: raw['호선명'],
    isTransferStation: parseYn(raw['환승역 여부']),
    status,
  }
}

export function transformElevatorApiResponse(
  response: RawElevatorApiResponse
): ElevatorRecord[] {
  return response.data.map(transformElevatorRecord)
}

function worstStatus(statuses: ElevatorStatus[]): ElevatorStatus {
  if (statuses.includes('broken')) return 'broken'
  if (statuses.includes('partial')) return 'partial'
  return 'normal'
}

export function groupByStation(records: ElevatorRecord[]): StationSummary[] {
  const map = new Map<string, ElevatorRecord[]>()

  for (const record of records) {
    const key = record.stationName
    const list = map.get(key) ?? []
    list.push(record)
    map.set(key, list)
  }

  return Array.from(map.entries()).map(([stationName, elevators]) => {
    const first = elevators[0]
    const statuses = elevators.map((e) => e.status)

    return {
      stationName,
      stationNo: first.stationNo,
      lineNumber: first.lineNumber,
      latitude: first.latitude,
      longitude: first.longitude,
      isTransferStation: first.isTransferStation,
      status: worstStatus(statuses),
      elevators,
      brokenCount: elevators.filter((e) => e.status === 'broken').length,
      partialCount: elevators.filter((e) => e.status === 'partial').length,
      normalCount: elevators.filter((e) => e.status === 'normal').length,
    }
  })
}
