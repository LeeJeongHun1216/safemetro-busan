import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { getDistinctAlternativeRouteLines } from '@/utils/elevatorDisplay'
import { STATUS_COLORS, STATUS_LABELS, getLineColor } from '@/utils/statusColors'

const LINES = [1, 2, 3, 4] as const

export function StationsView() {
  const stations = useAppStore((s) => s.stations)
  const stationSearch = useAppStore((s) => s.stationSearch)
  const selectedLine = useAppStore((s) => s.selectedLine)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const isLoading = useAppStore((s) => s.isLoading)
  const setStationSearch = useAppStore((s) => s.setStationSearch)
  const setSelectedLine = useAppStore((s) => s.setSelectedLine)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const focusStation = useAppStore((s) => s.focusStation)

  const filtered = useMemo(() => {
    return stations
      .filter((s) => {
        if (selectedLine !== 'all' && s.lineNumber !== selectedLine) return false
        if (statusFilter !== 'all' && s.status !== statusFilter) return false
        if (
          stationSearch &&
          !s.stationName.includes(stationSearch.replace(/역$/, ''))
        )
          return false
        return true
      })
      .sort((a, b) => a.stationName.localeCompare(b.stationName, 'ko'))
  }, [stations, stationSearch, selectedLine, statusFilter])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
      <div className="shrink-0 border-b border-slate-100 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">역별 정보</h2>
        <p className="mt-1 text-xs text-slate-500">
          부산 지하철 역별 엘리베이터·접근성 현황 ({filtered.length}개 역)
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <input
            type="search"
            value={stationSearch}
            onChange={(e) => setStationSearch(e.target.value)}
            placeholder="역명 검색..."
            className="min-w-[140px] flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          <select
            value={selectedLine === 'all' ? 'all' : String(selectedLine)}
            onChange={(e) =>
              setSelectedLine(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">전체 호선</option>
            {LINES.map((l) => (
              <option key={l} value={l}>
                {l}호선
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">전체 상태</option>
            <option value="normal">정상</option>
            <option value="partial">일부 장애</option>
            <option value="broken">고장</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-slate-400">로딩 중...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((station) => (
              <Card
                key={`${station.stationName}-${station.lineNumber}`}
                className="cursor-pointer p-4 transition hover:border-primary-200 hover:shadow-panel"
                onClick={() => focusStation(station.stationName)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {station.stationName}역
                    </h3>
                    <span
                      className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: getLineColor(station.lineNumber),
                      }}
                    >
                      {station.lineNumber}호선
                    </span>
                  </div>
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[station.status] }}
                    title={STATUS_LABELS[station.status]}
                  />
                </div>
                <div className="mt-3 flex gap-2 text-[10px]">
                  <span className="text-red-600">고장 {station.brokenCount}</span>
                  <span className="text-orange-600">
                    부분 {station.partialCount}
                  </span>
                  <span className="text-green-600">정상 {station.normalCount}</span>
                </div>
                {station.isTransferStation && (
                  <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                    환승역
                  </span>
                )}
                {getDistinctAlternativeRouteLines(station.elevators, 3).map(
                  (line) => (
                    <p
                      key={line}
                      className="mt-2 text-[10px] font-medium text-slate-700"
                    >
                      {line}
                    </p>
                  )
                )}
                <p className="mt-2 text-[10px] text-primary-600">
                  지도에서 보기 →
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
