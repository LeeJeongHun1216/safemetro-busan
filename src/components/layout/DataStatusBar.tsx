import { useAppStore } from '@/store/useAppStore'

const SOURCE_LABEL: Record<string, string> = {
  api: '공공데이터 API',
  backend: '백엔드 API',
  mock: 'Mock 데이터',
}

function formatLoadedAt(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DataStatusBar() {
  const dataLoadedAt = useAppStore((s) => s.dataLoadedAt)
  const dataSource = useAppStore((s) => s.dataSource)
  const statusCounts = useAppStore((s) => s.statusCounts)
  const isLoading = useAppStore((s) => s.isLoading)
  const isRefreshing = useAppStore((s) => s.isRefreshing)
  const refreshData = useAppStore((s) => s.refreshData)

  const hasAlerts = statusCounts.broken > 0 || statusCounts.partial > 0

  return (
    <div className="border-b border-slate-100 bg-white">
      {hasAlerts && !isLoading && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900">
          <span>⚠</span>
          <span>
            엘리베이터 고장 {statusCounts.broken}건 · 일부 장애{' '}
            {statusCounts.partial}건 — 경로 추천 시 반영됩니다
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-1.5 lg:px-6">
        <p className="text-[10px] text-slate-500">
          데이터: {SOURCE_LABEL[dataSource] ?? dataSource} · 갱신{' '}
          {formatLoadedAt(dataLoadedAt)}
          {statusCounts.total > 0 && (
            <span className="text-slate-400">
              {' '}
              · 총 {statusCounts.total}건
            </span>
          )}
        </p>
        <button
          type="button"
          onClick={() => void refreshData()}
          disabled={isLoading || isRefreshing}
          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {isRefreshing ? '새로고침 중…' : '데이터 새로고침'}
        </button>
      </div>
    </div>
  )
}
