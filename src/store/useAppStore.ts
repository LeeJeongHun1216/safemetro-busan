import { create } from 'zustand'
import { loadElevatorDataset } from '@/data/loadElevatorData'
import {
  loadFavoriteStations,
  saveFavoriteStations,
} from '@/utils/favorites'
import type { StatusCounts } from '@/data/loadElevatorData'
import {
  recommendRouteComparison,
  getStationNames,
} from '@/utils/routeRecommendation'
import type {
  UserType,
  StationSummary,
  RouteComparisonResult,
  DataSource,
  StatusFilter,
  NavTab,
  ElevatorRecord,
} from '@/types/elevator'

interface AppState {
  records: ElevatorRecord[]
  stations: StationSummary[]
  stationNames: string[]
  statusCounts: StatusCounts
  dataSource: DataSource
  dataError: string | null
  activeNav: NavTab
  stationSearch: string
  statusFilter: StatusFilter
  selectedLine: number | 'all'
  departureStation: string
  arrivalStation: string
  userType: UserType
  selectedStation: StationSummary | null
  routeComparison: RouteComparisonResult | null
  dataLoadedAt: number | null
  isLoading: boolean
  isRefreshing: boolean
  isRecommending: boolean
  mapReady: boolean
  mobilePanel: 'search' | 'map' | 'result'
  favoriteStations: string[]
  favoritesOpen: boolean

  setActiveNav: (tab: NavTab) => void
  setStationSearch: (q: string) => void
  setStatusFilter: (f: StatusFilter) => void
  setSelectedLine: (line: number | 'all') => void
  setDepartureStation: (name: string) => void
  setArrivalStation: (name: string) => void
  setUserType: (type: UserType) => void
  setSelectedStation: (station: StationSummary | null) => void
  setMapReady: (ready: boolean) => void
  setMobilePanel: (panel: 'search' | 'map' | 'result') => void
  swapStations: () => void
  requestRecommendation: () => Promise<void>
  loadData: () => Promise<void>
  refreshData: () => Promise<void>
  focusStation: (name: string) => void
  toggleFavoritesOpen: () => void
  addFavoriteStation: (name: string) => void
  removeFavoriteStation: (name: string) => void
  isFavoriteStation: (name: string) => boolean
}

const emptyCounts: StatusCounts = {
  broken: 0,
  partial: 0,
  normal: 0,
  total: 0,
}

export const useAppStore = create<AppState>((set, get) => ({
  records: [],
  stations: [],
  stationNames: [],
  statusCounts: emptyCounts,
  dataSource: 'mock',
  dataError: null,
  activeNav: 'route',
  stationSearch: '',
  statusFilter: 'all',
  selectedLine: 'all',
  departureStation: '',
  arrivalStation: '',
  userType: 'wheelchair',
  selectedStation: null,
  routeComparison: null,
  dataLoadedAt: null,
  isLoading: true,
  isRefreshing: false,
  isRecommending: false,
  mapReady: false,
  mobilePanel: 'map',
  favoriteStations: loadFavoriteStations(),
  favoritesOpen: false,

  setActiveNav: (tab) => set({ activeNav: tab }),
  setStationSearch: (q) => set({ stationSearch: q }),
  setStatusFilter: (f) => set({ statusFilter: f }),
  setSelectedLine: (line) => set({ selectedLine: line }),
  setDepartureStation: (name) => set({ departureStation: name }),
  setArrivalStation: (name) => set({ arrivalStation: name }),
  setUserType: (type) => set({ userType: type }),
  setSelectedStation: (station) => set({ selectedStation: station }),
  setMapReady: (ready) => set({ mapReady: ready }),
  setMobilePanel: (panel) => set({ mobilePanel: panel }),

  swapStations: () => {
    const { departureStation, arrivalStation } = get()
    set({
      departureStation: arrivalStation,
      arrivalStation: departureStation,
    })
  },

  focusStation: (name) => {
    const station = get().stations.find((s) => s.stationName === name)
    if (station) {
      set({
        selectedStation: station,
        activeNav: 'route',
        mobilePanel: 'map',
      })
    }
  },

  toggleFavoritesOpen: () =>
    set((s) => ({ favoritesOpen: !s.favoritesOpen })),

  addFavoriteStation: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const { favoriteStations, stationNames } = get()
    if (!stationNames.includes(trimmed)) return
    if (favoriteStations.includes(trimmed)) return
    const next = [...favoriteStations, trimmed]
    saveFavoriteStations(next)
    set({ favoriteStations: next, favoritesOpen: true })
  },

  removeFavoriteStation: (name) => {
    const next = get().favoriteStations.filter((n) => n !== name)
    saveFavoriteStations(next)
    set({ favoriteStations: next })
  },

  isFavoriteStation: (name) => get().favoriteStations.includes(name),

  loadData: async () => {
    const silent = get().isRefreshing
    if (!silent) set({ isLoading: true, dataError: null })
    else set({ dataError: null })

    try {
      const dataset = await loadElevatorDataset()
      const names = getStationNames(dataset.stations)

      set({
        records: dataset.records,
        stations: dataset.stations,
        stationNames: names,
        statusCounts: dataset.statusCounts,
        dataSource: dataset.source,
        dataLoadedAt: Date.now(),
        isLoading: false,
        isRefreshing: false,
      })

    } catch (error) {
      const message =
        error instanceof Error ? error.message : '데이터 로드에 실패했습니다.'
      set({ dataError: message, isLoading: false, isRefreshing: false })
    }
  },

  refreshData: async () => {
    set({ isRefreshing: true, dataError: null })
    await get().loadData()
  },

  requestRecommendation: async () => {
    const { departureStation, arrivalStation, userType, stations } = get()
    if (stations.length === 0) return
    if (!departureStation.trim() || !arrivalStation.trim()) return

    set({ isRecommending: true, routeComparison: null, mobilePanel: 'result' })

    await new Promise((r) => setTimeout(r, 500))

    const result = recommendRouteComparison(
      departureStation,
      arrivalStation,
      userType,
      stations
    )

    set({
      routeComparison: result,
      isRecommending: false,
      mobilePanel: 'result',
    })
  },
}))
