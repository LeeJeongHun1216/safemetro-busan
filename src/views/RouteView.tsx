import { SearchPanel } from '@/components/panels/SearchPanel'
import { ResultPanel } from '@/components/panels/ResultPanel'
import { KakaoMapView } from '@/components/map/KakaoMapView'
import { useAppStore } from '@/store/useAppStore'

export function RouteView() {
  const mobilePanel = useAppStore((s) => s.mobilePanel)
  const setMobilePanel = useAppStore((s) => s.setMobilePanel)

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* 모바일 탭 */}
      <div className="flex shrink-0 border-b border-slate-100 bg-white lg:hidden">
        {(
          [
            { id: 'search' as const, label: '검색' },
            { id: 'map' as const, label: '지도' },
            { id: 'result' as const, label: 'AI 결과' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobilePanel(tab.id)}
            className={`flex-1 py-2.5 text-xs font-semibold ${
              mobilePanel === tab.id
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-slate-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className={`${mobilePanel === 'search' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:flex`}
      >
        <SearchPanel />
      </div>

      <div
        className={`${mobilePanel === 'map' ? 'flex' : 'hidden'} min-h-0 min-h-[50vh] flex-1 lg:flex`}
      >
        <KakaoMapView />
      </div>

      <div
        className={`${mobilePanel === 'result' ? 'flex' : 'hidden'} min-h-0 flex-1 lg:flex`}
      >
        <ResultPanel />
      </div>
    </div>
  )
}
