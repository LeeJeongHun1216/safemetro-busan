import { fetchElevatorsFromBackend, isBackendApiConfigured } from '@/api/backendApi'
import { fetchAllElevatorRawRecords, isOdcloudApiConfigured } from '@/api/elevatorApi'
import { rawElevatorApiResponse } from '@/mock/rawElevatorData'
import {
  transformElevatorRecord,
  groupByStation,
} from '@/transform/transformElevatorData'
import type {
  ElevatorRecord,
  StationSummary,
  DataSource,
  RawElevatorRecord,
} from '@/types/elevator'

export interface ElevatorDataset {
  records: ElevatorRecord[]
  stations: StationSummary[]
  statusCounts: StatusCounts
  source: DataSource
}

export interface StatusCounts {
  broken: number
  partial: number
  normal: number
  total: number
}

function computeStatusCounts(records: ElevatorRecord[]): StatusCounts {
  let broken = 0
  let partial = 0
  let normal = 0

  for (const record of records) {
    if (record.status === 'broken') broken++
    else if (record.status === 'partial') partial++
    else normal++
  }

  return { broken, partial, normal, total: records.length }
}

function recordsFromRaw(rawList: RawElevatorRecord[]) {
  return rawList.map(transformElevatorRecord)
}

export async function loadElevatorDataset(): Promise<ElevatorDataset> {
  if (isBackendApiConfigured()) {
    try {
      const response = await fetchElevatorsFromBackend()
      const records = recordsFromRaw(response.data)
      const stations = groupByStation(records)
      return {
        records,
        stations,
        statusCounts: computeStatusCounts(records),
        source: 'backend',
      }
    } catch (error) {
      console.warn('[SafeMetro] 백엔드 API 실패, 직접 연동 시도:', error)
    }
  }

  if (isOdcloudApiConfigured()) {
    try {
      const rawList = await fetchAllElevatorRawRecords()
      const records = recordsFromRaw(rawList)
      const stations = groupByStation(records)
      return {
        records,
        stations,
        statusCounts: computeStatusCounts(records),
        source: 'api',
      }
    } catch (error) {
      console.warn('[SafeMetro] ODcloud API 실패, Mock 대체:', error)
    }
  }

  const records = recordsFromRaw(rawElevatorApiResponse.data)
  const stations = groupByStation(records)
  return {
    records,
    stations,
    statusCounts: computeStatusCounts(records),
    source: 'mock',
  }
}
