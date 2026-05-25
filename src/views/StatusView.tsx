import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  formatAlternativeRouteLine,
  getDistinctStatusRecords,
  statusRecordDedupeKey,
} from '@/utils/elevatorDisplay'
import { STATUS_COLORS, STATUS_LABELS } from '@/utils/statusColors'
import type { ElevatorStatus } from '@/types/elevator'

export function StatusView() {
  const records = useAppStore((s) => s.records)
  const statusFilter = useAppStore((s) => s.statusFilter)
  const stationSearch = useAppStore((s) => s.stationSearch)
  const isLoading = useAppStore((s) => s.isLoading)
  const dataSource = useAppStore((s) => s.dataSource)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const setStationSearch = useAppStore((s) => s.setStationSearch)
  const focusStation = useAppStore((s) => s.focusStation)

  const statusCounts = useAppStore((s) => s.statusCounts)

  const distinctRecords = useMemo(
    () => getDistinctStatusRecords(records),
    [records]
  )

  const filtered = useMemo(() => {
    const q = stationSearch.replace(/역$/, '').trim().toLowerCase()

    return distinctRecords
      .filter((r) => {
        if (statusFilter !== 'all' && r.status !== statusFilter) return false
        if (!q) return true
        return (
          r.stationName.toLowerCase().includes(q) ||
          r.learningLabel.toLowerCase().includes(q) ||
          r.alternativeRoute.toLowerCase().includes(q) ||
          String(r.elevatorInternalNo).includes(q)
        )
      })
      .sort((a, b) => {
        const order: Record<ElevatorStatus, number> = {
          broken: 0,
          partial: 1,
          normal: 2,
        }
        return order[a.status] - order[b.status]
      })
  }, [distinctRecords, statusFilter, stationSearch])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-slate-50/50">
      <div className="shrink-0 border-b border-slate-100 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">장애 현황</h2>
            <p className="mt-1 text-xs text-slate-500">
              엘리베이터·대체경로 모니터링 (중복 안내 제거 {statusCounts.total}건)
              {(dataSource === 'api' || dataSource === 'backend') && (
                <span className="ml-2 text-primary-600">· 공공데이터 연동</span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {(['broken', 'partial', 'normal'] as ElevatorStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl border p-3 text-left transition ${
                statusFilter === status
                  ? 'border-primary-400 ring-2 ring-primary-100'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-xs font-medium text-slate-600">
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {status === 'broken'
                  ? statusCounts.broken
                  : status === 'partial'
                    ? statusCounts.partial
                    : statusCounts.normal}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            type="search"
            value={stationSearch}
            onChange={(e) => setStationSearch(e.target.value)}
            placeholder="역명·엘리베이터 검색..."
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
          />
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            전체 보기
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-slate-400">로딩 중...</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">역명</th>
                <th className="px-4 py-3 font-semibold">호선</th>
                <th className="px-4 py-3 font-semibold">엘리베이터</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3 font-semibold">대체 경로</th>
                <th className="px-4 py-3 font-semibold">복잡도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.slice(0, 200).map((r) => (
                <tr
                  key={statusRecordDedupeKey(r)}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => focusStation(r.stationName)}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {r.stationName}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{r.lineNumber}호선</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.elevatorInternalNo}호기
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${STATUS_COLORS[r.status]}20`,
                        color: STATUS_COLORS[r.status],
                      }}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-xs text-slate-600">
                    {formatAlternativeRouteLine(r) ?? r.learningLabel}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {r.complexityScore > 0 ? r.complexityScore : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && filtered.length > 200 && (
          <p className="border-t border-slate-100 bg-white py-3 text-center text-xs text-slate-400">
            상위 200건만 표시됩니다. 검색으로 좁혀보세요.
          </p>
        )}
      </div>
    </div>
  )
}
