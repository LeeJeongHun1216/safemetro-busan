import {
  ODCLOUD_DATASET_PATH,
  ODCLOUD_DEFAULT_BASE,
} from '@/api/constants'
import type { RawElevatorRecord, RawOdcloudApiResponse } from '@/types/elevator'

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_ODCLOUD_API_BASE as string | undefined
  return (base?.replace(/\/$/, '') || ODCLOUD_DEFAULT_BASE).replace(/\/$/, '')
}

function getServiceKey(): string | undefined {
  const key = import.meta.env.VITE_ODCLOUD_SERVICE_KEY as string | undefined
  if (!key || key === 'your_odcloud_service_key_here') return undefined
  return key
}

function buildUrl(page: number, perPage: number): string {
  const serviceKey = getServiceKey()
  if (!serviceKey) {
    throw new Error('VITE_ODCLOUD_SERVICE_KEY가 설정되지 않았습니다.')
  }

  const params = new URLSearchParams({
    page: String(page),
    perPage: String(perPage),
    serviceKey,
  })

  return `${getApiBaseUrl()}${ODCLOUD_DATASET_PATH}?${params.toString()}`
}

export async function fetchElevatorPage(
  page = 1,
  perPage = 500
): Promise<RawOdcloudApiResponse> {
  const url = buildUrl(page, perPage)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(
      `공공데이터 API 오류 (${response.status}): ${response.statusText}`
    )
  }

  const json = (await response.json()) as RawOdcloudApiResponse

  if (!Array.isArray(json.data)) {
    throw new Error('공공데이터 API 응답 형식이 올바르지 않습니다.')
  }

  return json
}

/** 전체 데이터 페이지네이션 수집 (총 900건+) */
export async function fetchAllElevatorRawRecords(): Promise<RawElevatorRecord[]> {
  const perPage = 500
  const first = await fetchElevatorPage(1, perPage)
  const all: RawElevatorRecord[] = [...first.data]

  const totalPages = Math.ceil(first.totalCount / perPage)

  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchElevatorPage(page, perPage)
    all.push(...next.data)
  }

  return all
}

export function isOdcloudApiConfigured(): boolean {
  return Boolean(getServiceKey())
}
