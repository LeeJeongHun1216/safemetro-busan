import { create } from 'zustand'
import { loadElevatorDataset } from '@/data/loadElevatorData'
import {
  loadFavoriteStations,
  saveFavoriteStations,
} from '@/utils/favorites'
import type { StatusCounts } from '@/data/loadElevatorData'
import { recommendRoute, getStationNames } from '@/utils/routeRecommendation'
import type {
  UserType,
  StationSummary,
  RouteRecommendation,
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
  recommendation: RouteRecommendation | null
  isLoading: boolean
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
  departureStation: '서면',
  arrivalStation: '연산',
  userType: 'wheelchair',
  selectedStation: null,
  recommendation: null,
  isLoading: true,
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
    set({ isLoading: true, dataError: null })

    try {
      const dataset = await loadElevatorDataset()
      const names = getStationNames(dataset.stations)

      set({
        records: dataset.records,
        stations: dataset.stations,
        stationNames: names,
        statusCounts: dataset.statusCounts,
        dataSource: dataset.source,
        isLoading: false,
      })

      await get().requestRecommendation()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '데이터 로드에 실패했습니다.'
      set({ dataError: message, isLoading: false })
    }
  },

  requestRecommendation: async () => {
    const { departureStation, arrivalStation, userType, stations } = get()
    if (stations.length === 0) return

    set({ isRecommending: true, recommendation: null })

    await new Promise((r) => setTimeout(r, 500))

    const result = recommendRoute(
      departureStation,
      arrivalStation,
      userType,
      stations
    )

    set({
      recommendation: result,
      isRecommending: false,
    })
  },
}))
