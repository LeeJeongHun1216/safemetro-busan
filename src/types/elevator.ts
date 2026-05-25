/** Raw API response shape (Korean field names) */
export interface RawElevatorRecord {
  '경로 이용 가능 여부': string
  '경로복잡도 등급': string
  /** 이동불가(N) 시 공란·null 가능 (Swagger 명세) */
  '경로복잡도 점수': number | string | null
  '단계별 대체 경로': string
  '대체경로유형': string
  '도착 구분': string
  '도착층': string
  '도착층위': number
  '승강장 유형': string
  '엘리베이터 고유번호': string
  '엘리베이터 내부 관리번호': number
  '역 경도': string
  '역 위도': string
  '역명': string
  '역번호': number
  '이동방향': string
  '종착역 여부': string
  '출발 구분': string
  '출발층': string
  '출발층위': number
  '학습라벨': string
  '호선명': number
  '환승역 여부': string
}

/** Mock·단순 래퍼 */
export interface RawElevatorApiResponse {
  data: RawElevatorRecord[]
}

/** 공공데이터포털(ODcloud) 실제 API 응답 */
export interface RawOdcloudApiResponse {
  page: number
  perPage: number
  totalCount: number
  currentCount: number
  matchCount: number
  data: RawElevatorRecord[]
}

export type DataSource = 'api' | 'mock' | 'backend'

export type NavTab = 'route' | 'stations' | 'status' | 'guide'

export type StatusFilter = 'all' | 'normal' | 'partial' | 'broken'

export type ElevatorStatus = 'normal' | 'partial' | 'broken'

/** 장애 요약·패널용 (중복 안내 제거 후 집계) */
export interface StatusCounts {
  broken: number
  partial: number
  normal: number
  total: number
}

export type AlternativeRouteType =
  | 'ALT_ELV'
  | 'ALT_STAIRS'
  | 'ALT_ESCALATOR'
  | 'NORMAL'

export type ComplexityGrade = 'simple' | 'moderate' | 'complex'

export interface ElevatorRecord {
  isRouteAvailable: boolean
  complexityGrade: ComplexityGrade
  complexityScore: number
  alternativeRoute: string
  alternativeRouteType: AlternativeRouteType
  arrivalZone: string
  arrivalFloor: string
  arrivalFloorLevel: number
  platformType: string
  elevatorId: string
  elevatorInternalNo: number
  longitude: number
  latitude: number
  stationName: string
  stationNo: number
  moveDirection: string
  isTerminalStation: boolean
  departureZone: string
  departureFloor: string
  departureFloorLevel: number
  learningLabel: string
  lineNumber: number
  isTransferStation: boolean
  status: ElevatorStatus
}

export interface StationSummary {
  stationName: string
  stationNo: number
  lineNumber: number
  latitude: number
  longitude: number
  isTransferStation: boolean
  status: ElevatorStatus
  elevators: ElevatorRecord[]
  brokenCount: number
  partialCount: number
  normalCount: number
}

export type UserType = 'wheelchair' | 'elderly' | 'stroller' | 'general'

export interface RouteStep {
  id: string
  type: 'station' | 'ride' | 'transfer' | 'arrival'
  title: string
  subtitle?: string
  durationMinutes?: number
  alert?: { level: 'warning' | 'success' | 'info'; message: string }
  subSteps?: string[]
  lineNumber?: number
}

export interface RouteRecommendation {
  departureStation: string
  arrivalStation: string
  estimatedMinutes: number
  transferCount: number
  convenienceScore: number
  aiInsight: string
  aiSummary: string
  steps: RouteStep[]
  pathStationNames: string[]
  routeType: 'accessibility' | 'shortest'
}

export interface RouteComparisonResult {
  recommended: RouteRecommendation
  shortest: RouteRecommendation
  pathsAreEqual: boolean
  whyRecommended: string[]
  comparisonSummary: string
}
