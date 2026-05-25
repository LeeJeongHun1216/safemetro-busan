import { rawElevatorApiResponse } from '@/mock/rawElevatorData'
import { groupByStation } from '@/transform/transformElevatorData'
import { prepareElevatorRecords } from '@/data/prepareElevatorRecords'
import { computeStatusCounts } from '@/utils/elevatorDisplay'
import type { ElevatorRecord, StationSummary } from '@/types/elevator'

/** 개발·테스트용 정적 Mock */
export const mockElevatorRecords: ElevatorRecord[] = prepareElevatorRecords(
  rawElevatorApiResponse.data
)

export const mockStationSummaries: StationSummary[] =
  groupByStation(mockElevatorRecords)

export { computeStatusCounts as getStatusCounts }
