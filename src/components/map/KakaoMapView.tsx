import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useKakaoMap } from '@/hooks/useKakaoMap'
import { MapControls } from '@/components/map/MapControls'
import { StationDetailCard } from '@/components/map/StationDetailCard'

export function KakaoMapView() {
  const stations = useAppStore((s) => s.stations)
  const routeComparison = useAppStore((s) => s.routeComparison)
  const selectedStation = useAppStore((s) => s.selectedStation)
  const setSelectedStation = useAppStore((s) => s.setSelectedStation)
  const setMapReady = useAppStore((s) => s.setMapReady)
  const mapReady = useAppStore((s) => s.mapReady)
  const isLoading = useAppStore((s) => s.isLoading)

  const handleMapReady = useCallback(() => setMapReady(true), [setMapReady])

  const { containerRef, error, isMapReady, zoomIn, zoomOut, resetCenter } =
    useKakaoMap({
      stations,
      routeComparison,
      selectedStation,
      onStationClick: setSelectedStation,
      onReady: handleMapReady,
    })

  return (
    <main className="map-panel relative min-h-[320px] flex-1 bg-slate-100">
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />

      {!isMapReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
          <p className="mt-3 text-sm text-slate-500">지도를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-2xl">🗺️</p>
            <p className="mt-2 text-sm font-semibold text-amber-900">
              카카오맵을 불러올 수 없습니다
            </p>
            <p className="mt-2 text-xs text-amber-800">{error}</p>
            <p className="mt-4 text-xs text-slate-600">
              프로젝트 루트에 <code className="rounded bg-white px-1">.env</code>{' '}
              파일을 만들고{' '}
              <code className="rounded bg-white px-1">VITE_KAKAO_MAP_KEY</code>를
              설정해주세요.
            </p>
            {/* Fallback visual map placeholder */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-left">
              {stations.slice(0, 9).map((s) => (
                <button
                  key={s.stationName}
                  type="button"
                  onClick={() => setSelectedStation(s)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] hover:border-primary-300"
                >
                  {s.stationName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(isMapReady || mapReady) && !error && (
        <MapControls
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetCenter}
        />
      )}

      {selectedStation && (
        <StationDetailCard
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
        />
      )}

      {isLoading && (
        <div className="pointer-events-none absolute inset-0 bg-white/40" />
      )}
    </main>
  )
}
