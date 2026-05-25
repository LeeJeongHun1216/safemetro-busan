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

/**
 * 부산 지하철 역번호: 앞자리 = 호선 (119→1호선, 219→2호선, 406→4호선).
 * 공공데이터 일부 행(서동·명장 등)은 `호선명`에 4~11이 들어가 실제 호선과 다름 → 역번호 우선.
 */
export function parseMetroLineNumber(
  lineField: number,
  stationNo: number
): number {
  if (stationNo >= 100) {
    return Math.floor(stationNo / 100)
  }
  if (lineField >= 1 && lineField <= 4) {
    return lineField
  }
  return lineField
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

/**
 * 공공데이터 필드 기반 상태 추론 (API에 "일부 장애" 컬럼 없음)
 *
 * - broken: 경로 불가 또는 고장·이용불가가 명확한 경우
 * - partial: "부분 장애", 점검, 일부 등 실제 제한이 드러난 경우만
 * - normal: "정상 운행", "대체 엘리베이터 이용"(안내) 등
 *
 * ※ '대체' 단어만으로는 partial 처리하지 않음 (과다 분류 방지)
 * ※ ALT_ELV는 부산 데이터 대부분이 NORMAL/ALT_ELV라 partial 기준에서 제외
 */
export function deriveElevatorStatus(
  record: RawElevatorRecord
): ElevatorStatus {
  const label = (record['학습라벨'] ?? '').trim()
  const altType = record['대체경로유형'] ?? ''
  const available = record['경로 이용 가능 여부'] === YES

  const hasBrokenKeyword =
    label.includes('고장') ||
    label.includes('이용 불가') ||
    label.includes('이용불가') ||
    label.includes('이동불가') ||
    label.includes('이동 불가')

  const hasMovementBlockType =
    altType.includes('이동 불가') || altType.includes('이동불가')

  if (!available || hasBrokenKeyword || hasMovementBlockType) {
    return 'broken'
  }

  const isExplicitPartial =
    label.includes('부분') ||
    label.includes('일부') ||
    (label.includes('점검') && !label.includes('정상'))

  const isStairsOnlyAlt =
    altType === 'ALT_STAIRS' && !label.includes('정상')

  if (isExplicitPartial || isStairsOnlyAlt) {
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
    lineNumber: parseMetroLineNumber(raw['호선명'], raw['역번호']),
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
    const key = `${record.stationName}::${record.lineNumber}`
    const list = map.get(key) ?? []
    list.push(record)
    map.set(key, list)
  }

  return Array.from(map.entries()).map(([, elevators]) => {
    const first = elevators[0]
    const statuses = elevators.map((e) => e.status)

    return {
      stationName: first.stationName,
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
