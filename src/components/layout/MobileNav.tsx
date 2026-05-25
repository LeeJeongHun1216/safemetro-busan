import { useAppStore } from '@/store/useAppStore'
import type { NavTab } from '@/types/elevator'

const ITEMS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'route', label: '경로', icon: '🗺️' },
  { id: 'stations', label: '역 정보', icon: '🚉' },
  { id: 'status', label: '장애', icon: '⚠️' },
  { id: 'guide', label: '안내', icon: '📖' },
]

export function MobileNav() {
  const activeNav = useAppStore((s) => s.activeNav)
  const setActiveNav = useAppStore((s) => s.setActiveNav)

  return (
    <nav className="flex shrink-0 border-t border-slate-100 bg-white md:hidden">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setActiveNav(item.id)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${
            activeNav === item.id ? 'text-primary-600' : 'text-slate-500'
          }`}
        >
          <span className="text-base">{item.icon}</span>
          <span className="text-[10px] font-semibold">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
