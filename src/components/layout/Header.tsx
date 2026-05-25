import { useAppStore } from '@/store/useAppStore'

const NAV_ITEMS = [
  { id: 'route' as const, label: 'AI 경로 추천' },
  { id: 'stations' as const, label: '역별 정보' },
  { id: 'status' as const, label: '장애 현황' },
  { id: 'guide' as const, label: '이용 안내' },
]

export function Header() {
  const activeNav = useAppStore((s) => s.activeNav)
  const setActiveNav = useAppStore((s) => s.setActiveNav)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-sm font-bold text-white">
          SM
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 lg:text-base">
            SafeMetro 부산
          </h1>
          <p className="hidden text-[11px] text-slate-500 sm:block">
            AI 기반 교통약자 이동 지원 플랫폼
          </p>
        </div>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveNav(item.id)}
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              activeNav === item.id
                ? 'text-primary-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
            {activeNav === item.id && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary-600" />
            )}
          </button>
        ))}
      </nav>
    </header>
  )
}
