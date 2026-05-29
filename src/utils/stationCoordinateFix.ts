import type { ElevatorRecord } from '@/types/elevator'

/**
 * 공공데이터 3호선(302~317) 좌표 오배치 보정.
 * 지도 마커역 → 실제 위치인 역 (사용자 확인) 기준으로,
 * 역 S의 올바른 좌표 = API에 잘못 붙은 역 M의 원본 좌표 (M의 마커가 S 위치에 있음).
 */
const LINE3_COORD_SOURCE_BY_STATION_NO: Partial<Record<number, number>> = {
  302: 316, // 망미 → 체육공원
  303: 315, // 배산 → 강서구청
  304: 314, // 물만골 → 구포
  305: 313, // 연산 → 덕천
  306: 312, // 거제 → 숙등
  307: 311, // 종합운동장 → 남산정
  308: 310, // 사직 → 만덕
  310: 308, // 만덕 → 사직
  311: 307, // 남산정 → 종합운동장
  312: 306, // 숙등 → 거제
  313: 305, // 덕천 → 연산
  314: 304, // 구포 → 물만골
  315: 303, // 강서구청 → 배산
  316: 302, // 체육공원 → 망미
  // 208(2호선 수영)은 원본 좌표 유지
}

/** 공공데이터에 수영(동쪽) 좌표가 붙어 있는 3호선 종점 — 실제 강서구 대저역 */
const MANUAL_STATION_COORDS: Partial<
  Record<number, { latitude: number; longitude: number }>
> = {
  /** 1호선 동매역 — 공공데이터 좌표 보정 */
  100: { latitude: 35.08976051613637, longitude: 128.97337483432813 },
  317: { latitude: 35.213317928835785, longitude: 128.96082371290117 },
}

function buildCoordByStationNo(
  records: ElevatorRecord[]
): Map<number, { latitude: number; longitude: number }> {
  const map = new Map<number, { latitude: number; longitude: number }>()
  for (const r of records) {
    if (!map.has(r.stationNo)) {
      map.set(r.stationNo, {
        latitude: r.latitude,
        longitude: r.longitude,
      })
    }
  }
  return map
}

/** 보정 적용 전 원본 좌표를 유지한 채 역번호별로 치환 */
export function applyStationCoordinateFixes(records: ElevatorRecord[]): void {
  const byNo = buildCoordByStationNo(records)

  for (const r of records) {
    const manual = MANUAL_STATION_COORDS[r.stationNo]
    if (manual) {
      r.latitude = manual.latitude
      r.longitude = manual.longitude
      continue
    }

    const sourceNo = LINE3_COORD_SOURCE_BY_STATION_NO[r.stationNo]
    if (sourceNo === undefined) continue

    const src = byNo.get(sourceNo)
    if (!src) continue

    r.latitude = src.latitude
    r.longitude = src.longitude
  }
}
