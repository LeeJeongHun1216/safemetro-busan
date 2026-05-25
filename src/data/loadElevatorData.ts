import { fetchElevatorsFromBackend, isBackendApiConfigured } from '@/api/backendApi'
import { fetchAllElevatorRawRecords, isOdcloudApiConfigured } from '@/api/elevatorApi'
import { rawElevatorApiResponse } from '@/mock/rawElevatorData'
import { groupByStation } from '@/transform/transformElevatorData'
import { prepareElevatorRecords } from '@/data/prepareElevatorRecords'
import { computeStatusCounts } from '@/utils/elevatorDisplay'
import type {
  ElevatorRecord,
  StationSummary,
  DataSource,
  StatusCounts,
} from '@/types/elevator'

export type { StatusCounts }

export interface ElevatorDataset {
  records: ElevatorRecord[]
  stations: StationSummary[]
  statusCounts: StatusCounts
  source: DataSource
}

export async function loadElevatorDataset(): Promise<ElevatorDataset> {
  if (isBackendApiConfigured()) {
    try {
      const response = await fetchElevatorsFromBackend()
      const records = prepareElevatorRecords(response.data)
      return {
        records,
        stations: groupByStation(records),
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
      const records = prepareElevatorRecords(rawList)
      return {
        records,
        stations: groupByStation(records),
        statusCounts: computeStatusCounts(records),
        source: 'api',
      }
    } catch (error) {
      console.warn('[SafeMetro] ODcloud API 실패, Mock 대체:', error)
    }
  }

  const records = prepareElevatorRecords(rawElevatorApiResponse.data)
  return {
    records,
    stations: groupByStation(records),
    statusCounts: computeStatusCounts(records),
    source: 'mock',
  }
}
