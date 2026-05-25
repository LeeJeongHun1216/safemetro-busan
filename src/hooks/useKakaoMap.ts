import { useEffect, useRef, useState, useCallback } from 'react'
import { loadKakaoMapScript } from '@/utils/kakaoMapLoader'
import { mergeStationsAtSameLocation } from '@/utils/mergeMapMarkers'
import {
  buildRouteMapSegments,
  collectPathBounds,
} from '@/utils/routeMapPath'
import {
  createStationMarkerElement,
  resolveStationCoords,
} from '@/utils/stationMapMarker'
import type { RouteComparisonResult, StationSummary } from '@/types/elevator'
import { buildMetroGraphFromStations } from '@/utils/metroGraph'

const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 }

interface UseKakaoMapOptions {
  stations: StationSummary[]
  selectedStation: StationSummary | null
  routeComparison: RouteComparisonResult | null
  onStationClick: (station: StationSummary) => void
  onReady?: () => void
}

export function useKakaoMap({
  stations,
  selectedStation,
  routeComparison,
  onStationClick,
  onReady,
}: UseKakaoMapOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const polylinesRef = useRef<kakao.maps.Polyline[]>([])
  const hasFittedBoundsRef = useRef(false)
  const onStationClickRef = useRef(onStationClick)
  const onReadyRef = useRef(onReady)
  const [error, setError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  onStationClickRef.current = onStationClick
  onReadyRef.current = onReady

  const clearMarkers = useCallback(() => {
    overlaysRef.current.forEach((o) => o.setMap(null))
    overlaysRef.current = []
  }, [])

  const clearPolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []
  }, [])

  const drawRoutePolylines = useCallback(() => {
    const map = mapRef.current
    if (!map || !routeComparison) {
      clearPolylines()
      return
    }

    clearPolylines()
    const graph = buildMetroGraphFromStations(stations)

    const drawPath = (
      path: string[],
      strokeWeight: number,
      strokeOpacity: number,
      strokeStyle: 'solid' | 'shortdash'
    ) => {
      const segments = buildRouteMapSegments(path, stations, graph)
      for (const seg of segments) {
        const linePath = seg.path.map(
          (p) => new kakao.maps.LatLng(p.lat, p.lng)
        )
        const polyline = new kakao.maps.Polyline({
          path: linePath,
          strokeWeight,
          strokeColor: seg.color,
          strokeOpacity,
          strokeStyle,
          map,
          zIndex: strokeStyle === 'solid' ? 2 : 1,
        })
        polylinesRef.current.push(polyline)
      }
    }

    const { recommended, shortest, pathsAreEqual } = routeComparison

    if (!pathsAreEqual) {
      drawPath(shortest.pathStationNames, 4, 0.55, 'shortdash')
    }
    drawPath(recommended.pathStationNames, 6, 0.9, 'solid')

    const bounds = new kakao.maps.LatLngBounds()
    for (const p of collectPathBounds(recommended.pathStationNames, stations)) {
      bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
    }
    if (!pathsAreEqual) {
      for (const p of collectPathBounds(shortest.pathStationNames, stations)) {
        bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
      }
    }
    map.relayout()
    map.setBounds(bounds)
  }, [routeComparison, stations, clearPolylines])

  const renderMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    const uniqueStations = new Map<string, StationSummary>()
    for (const s of stations) {
      const key = `${s.stationName}::${s.lineNumber}`
      if (!uniqueStations.has(key)) {
        uniqueStations.set(key, s)
      }
    }

    const markersToShow = mergeStationsAtSameLocation(uniqueStations.values())

    const bounds = new kakao.maps.LatLngBounds()
    let placed = 0

    markersToShow.forEach((station) => {
      const coords = resolveStationCoords(station.latitude, station.longitude)
      if (!coords) return

      const position = new kakao.maps.LatLng(coords.latitude, coords.longitude)
      bounds.extend(position)

      const htmlOverlay = new kakao.maps.CustomOverlay({
        position,
        content: createStationMarkerElement(station, () =>
          onStationClickRef.current(station)
        ),
        map,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: station.isTransferStation ? 6 : 4,
      })
      overlaysRef.current.push(htmlOverlay)

      placed++
    })

    if (placed > 0 && !routeComparison) {
      map.relayout()
      if (placed > 1 && !hasFittedBoundsRef.current) {
        map.setBounds(bounds)
        hasFittedBoundsRef.current = true
      }
    }
  }, [stations, routeComparison, clearMarkers])

  useEffect(() => {
    let cancelled = false

    loadKakaoMapScript()
      .then(() => {
        if (cancelled || !containerRef.current) return

        const center = new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng)
        const map = new kakao.maps.Map(containerRef.current, {
          center,
          level: 6,
        })
        mapRef.current = map
        setIsMapReady(true)
        onReadyRef.current?.()
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
      clearMarkers()
      clearPolylines()
      mapRef.current = null
      setIsMapReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map init once per mount
  }, [clearMarkers, clearPolylines])

  useEffect(() => {
    if (isMapReady && stations.length > 0) renderMarkers()
  }, [isMapReady, stations, renderMarkers])

  useEffect(() => {
    if (isMapReady) drawRoutePolylines()
  }, [isMapReady, drawRoutePolylines])

  useEffect(() => {
    if (!isMapReady || !containerRef.current) return

    const observer = new ResizeObserver(() => {
      mapRef.current?.relayout()
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isMapReady])

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !selectedStation) return
    const coords = resolveStationCoords(
      selectedStation.latitude,
      selectedStation.longitude
    )
    if (!coords) return
    const pos = new kakao.maps.LatLng(coords.latitude, coords.longitude)
    mapRef.current.setCenter(pos)
    mapRef.current.setLevel(4)
    mapRef.current.relayout()
  }, [selectedStation, isMapReady])

  const zoomIn = () => {
    const map = mapRef.current
    if (map) map.setLevel(map.getLevel() - 1)
  }

  const zoomOut = () => {
    const map = mapRef.current
    if (map) map.setLevel(map.getLevel() + 1)
  }

  const resetCenter = () => {
    const map = mapRef.current
    if (map) {
      map.setCenter(new kakao.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng))
      map.setLevel(6)
    }
  }

  return {
    containerRef,
    error,
    isMapReady,
    zoomIn,
    zoomOut,
    resetCenter,
  }
}
