import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/Card'
import type { UserType } from '@/types/elevator'

const USER_TYPES: { id: UserType; label: string; icon: string }[] = [
  { id: 'wheelchair', label: '휠체어\n사용자', icon: '♿' },
  { id: 'stroller', label: '유모차\n사용자', icon: '👶' },
  { id: 'elderly', label: '노약자\n사용자', icon: '🧓' },
  { id: 'general', label: '일반\n사용자', icon: '🚶' },
]

function StationInput({
  label,
  value,
  onChange,
  stationNames,
  showShortcuts,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  stationNames: string[]
  showShortcuts?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>
        <input
          type="text"
          list={`stations-${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="역명을 입력하세요"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
        <datalist id={`stations-${label}`}>
          {stationNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      {showShortcuts && (
        <div className="mt-2 flex gap-1.5">
          {['내 위치', '최근 역', '즐겨찾기'].map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] text-slate-500 hover:bg-slate-50"
            >
              {tag}
            </button>
          ))}
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
  } = useAppStore()

  const now = new Date()
  const timestamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} 기준`

  return (
    <aside className="flex w-full shrink-0 flex-col gap-3 overflow-y-auto border-r border-slate-100 bg-slate-50/50 p-3 lg:w-[300px] xl:w-[320px]">
      <Card className="p-4">
        <h2 className="text-base font-bold text-slate-900">경로 찾기</h2>
        <p className="mt-1 text-xs text-slate-500">
          출발역과 도착역, 사용자 유형을 선택해주세요.
        </p>

        <div className="mt-4 space-y-3">
          <StationInput
            label="출발역"
            value={departureStation}
            onChange={setDepartureStation}
            stationNames={stationNames}
            showShortcuts
          />

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

          <StationInput
            label="도착역"
            value={arrivalStation}
            onChange={setArrivalStation}
            stationNames={stationNames}
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
          <h3 className="text-sm font-bold text-slate-900">실시간 장애 요약</h3>
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
        <button
          type="button"
          className="mt-3 w-full text-center text-xs font-medium text-primary-600 hover:underline"
        >
          전체 장애 현황 보기 &gt;
        </button>
      </Card>
    </aside>
  )
}
