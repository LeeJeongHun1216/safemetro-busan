import type { RawOdcloudApiResponse } from '@/types/elevator'

function getBackendBase(): string {
  const base = import.meta.env.VITE_BACKEND_API_BASE as string | undefined
  return base?.replace(/\/$/, '') ?? ''
}

export function isBackendApiConfigured(): boolean {
  return Boolean(getBackendBase())
}

export async function fetchElevatorsFromBackend(): Promise<RawOdcloudApiResponse> {
  const base = getBackendBase()
  const url = `${base}/api/v1/elevators?all=true`
  const response = await fetch(url)

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`백엔드 API 오류 (${response.status}): ${detail.slice(0, 120)}`)
  }

  const json = (await response.json()) as RawOdcloudApiResponse

  if (!Array.isArray(json.data)) {
    throw new Error('백엔드 API 응답 형식이 올바르지 않습니다.')
  }

  return json
}
