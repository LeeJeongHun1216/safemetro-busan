import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import { StationNamePicker } from '@/components/panels/StationNamePicker'
import type { UserType } from '@/types/elevator'

const USER_TYPES: { id: UserType; label: string; icon: string }[] = [
  { id: 'wheelchair', label: '휠체어\n사용자', icon: '♿' },
  { id: 'stroller', label: '유모차\n사용자', icon: '👶' },
  { id: 'elderly', label: '노약자\n사용자', icon: '🧓' },
  { id: 'general', label: '일반\n사용자', icon: '🚶' },
]

function FavoritesPanel() {
  const {
    favoriteStations,
    favoritesOpen,
    toggleFavoritesOpen,
    setDepartureStation,
    setArrivalStation,
    removeFavoriteStation,
    departureStation,
    addFavoriteStation,
    isFavoriteStation,
  } = useAppStore()

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggleFavoritesOpen}
        className={`rounded-lg border px-2.5 py-1 text-[10px] font-medium transition ${
          favoritesOpen
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        ★ 즐겨찾기{favoriteStations.length > 0 ? ` (${favoriteStations.length})` : ''}
      </button>

      {favoritesOpen && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
          {favoriteStations.length === 0 ? (
            <p className="text-center text-[10px] text-slate-500">
              저장된 역이 없습니다. 출발역 옆 ☆를 눌러 추가하세요.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {favoriteStations.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-1 rounded-lg bg-slate-50 px-2 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
                    {name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDepartureStation(name)}
                    className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[9px] font-semibold text-primary-700 hover:bg-primary-100"
                  >
                    출발
                  </button>
                  <button
                    type="button"
                    onClick={() => setArrivalStation(name)}
                    className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    도착
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFavoriteStation(name)}
                    className="px-1 text-[10px] text-slate-400 hover:text-red-500"
                    aria-label={`${name} 즐겨찾기 삭제`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          {departureStation.trim() &&
            !isFavoriteStation(departureStation) && (
              <button
                type="button"
                onClick={() => addFavoriteStation(departureStation)}
                className="mt-2 w-full rounded-lg border border-dashed border-amber-200 py-1.5 text-[10px] font-medium text-amber-700 hover:bg-amber-50"
              >
                「{departureStation}」 즐겨찾기에 추가
              </button>
            )}
        </div>
      )}
    </div>
  )
}

export function SearchPanel() {
  const {
    departureStation,
    arrivalStation,
    userType,
    stationNames,
    statusCounts,
    dataSource,
    isLoading,
    isRecommending,
    setDepartureStation,
    setArrivalStation,
    setUserType,
    swapStations,
    requestRecommendation,
    addFavoriteStation,
    removeFavoriteStation,
    isFavoriteStation,
  } = useAppStore()

  const now = new Date()
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`

  const toggleDepartureFavorite = () => {
    const name = departureStation.trim()
    if (!name) return
    if (isFavoriteStation(name)) removeFavoriteStation(name)
    else addFavoriteStation(name)
  }

  const toggleArrivalFavorite = () => {
    const name = arrivalStation.trim()
    if (!name) return
    if (isFavoriteStation(name)) removeFavoriteStation(name)
    else addFavoriteStation(name)
  }

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-r border-slate-100 bg-slate-50/50 p-3 lg:w-[300px] xl:w-[320px]">
      <Card className="p-4">
        <h2 className="text-base font-bold text-slate-900">경로 찾기</h2>
        <p className="mt-1 text-xs text-slate-500">
          출발역과 도착역, 사용자 유형을 선택해주세요.
        </p>

        <div className="mt-4 space-y-3">
          <StationNamePicker
            label="출발역"
            value={departureStation}
            onChange={setDepartureStation}
            stationNames={stationNames}
            isFavorite={isFavoriteStation(departureStation.trim())}
            onToggleFavorite={toggleDepartureFavorite}
          />

          <FavoritesPanel />

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapStations}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              aria-label="출발/도착 교환"
            >
              ⇅
            </button>
          </div>

          <StationNamePicker
            label="도착역"
            value={arrivalStation}
            onChange={setArrivalStation}
            stationNames={stationNames}
            isFavorite={isFavoriteStation(arrivalStation.trim())}
            onToggleFavorite={toggleArrivalFavorite}
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-slate-600">사용자 유형</p>
          <div className="grid grid-cols-4 gap-1.5">
            {USER_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setUserType(t.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-center transition ${
                  userType === t.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="text-lg leading-none">{t.icon}</span>
                <span className="whitespace-pre-line text-[9px] font-medium leading-tight">
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={isRecommending}
          onClick={() => requestRecommendation()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {isRecommending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              AI 분석 중...
            </>
          ) : (
            <>✨ AI 경로 추천하기</>
          )}
        </button>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">실시간 장애 요약</h3>
            <p className="text-[10px] text-slate-400">
              중복 안내 통합 · 총 {statusCounts.total}건
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            {(dataSource === 'api' || dataSource === 'backend') && (
              <span className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[9px] font-semibold text-primary-600">
                {dataSource === 'backend' ? 'API 서버 연동' : '공공데이터 연동'}
              </span>
            )}
            <span className="text-[10px] text-slate-400">{timestamp}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {isLoading ? (
            <div className="col-span-3 py-6 text-center text-xs text-slate-400">
              데이터 불러오는 중...
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-red-50 px-2 py-3 text-center">
                <p className="text-[10px] text-red-600">고장</p>
                <p className="mt-1 text-xl font-bold text-red-600">
                  {statusCounts.broken}
                </p>
              </div>
              <div className="rounded-xl bg-orange-50 px-2 py-3 text-center">
                <p className="text-[10px] text-orange-600">일부 장애</p>
                <p className="mt-1 text-xl font-bold text-orange-600">
                  {statusCounts.partial}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 px-2 py-3 text-center">
                <p className="text-[10px] text-green-600">정상</p>
                <p className="mt-1 text-xl font-bold text-green-600">
                  {statusCounts.normal}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </aside>
  )
}
