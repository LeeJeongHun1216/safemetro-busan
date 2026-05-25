import { rawElevatorApiResponse } from '@/mock/rawElevatorData'
import {
  transformElevatorRecord,
  groupByStation,
} from '@/transform/transformElevatorData'
import { applyStationCoordinateFixes } from '@/utils/stationCoordinateFix'
import type { ElevatorRecord, StationSummary } from '@/types/elevator'
import type { StatusCounts } from '@/data/loadElevatorData'

/** 개발/테스트용 정적 Mock 데이터 */
export const mockElevatorRecords: ElevatorRecord[] = (() => {
  const records = rawElevatorApiResponse.data.map(transformElevatorRecord)
  applyStationCoordinateFixes(records)
  return records
})()

export const mockStationSummaries: StationSummary[] =
  groupByStation(mockElevatorRecords)

export function getStatusCounts(records: ElevatorRecord[]): StatusCounts {
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
