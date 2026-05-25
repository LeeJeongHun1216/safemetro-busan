import { transformElevatorRecord } from '@/transform/transformElevatorData'
import { applyStationCoordinateFixes } from '@/utils/stationCoordinateFix'
import type { ElevatorRecord, RawElevatorRecord } from '@/types/elevator'

export function prepareElevatorRecords(
  rawList: RawElevatorRecord[]
): ElevatorRecord[] {
  const records = rawList.map(transformElevatorRecord)
  applyStationCoordinateFixes(records)
  return records
}
