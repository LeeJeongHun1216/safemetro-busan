import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'
import { RouteView } from '@/views/RouteView'
import { StationsView } from '@/views/StationsView'
import { StatusView } from '@/views/StatusView'
import { GuideView } from '@/views/GuideView'
import { useAppStore } from '@/store/useAppStore'

export function MainPage() {
  const activeNav = useAppStore((s) => s.activeNav)
  const loadData = useAppStore((s) => s.loadData)
  const dataError = useAppStore((s) => s.dataError)

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      <Header />

      {dataError && (
        <div className="shrink-0 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          {dataError}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {activeNav === 'route' && <RouteView />}
        {activeNav === 'stations' && <StationsView />}
        {activeNav === 'status' && <StatusView />}
        {activeNav === 'guide' && <GuideView />}
      </div>

      <MobileNav />
    </div>
  )
}
