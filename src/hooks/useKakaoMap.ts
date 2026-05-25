import { useEffect, useRef, useState, useCallback } from 'react'
import { loadKakaoMapScript } from '@/utils/kakaoMapLoader'
import { createMarkerSvg, STATUS_COLORS } from '@/utils/statusColors'
import type { StationSummary } from '@/types/elevator'

const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 }

interface UseKakaoMapOptions {
  stations: StationSummary[]
  selectedStation: StationSummary | null
  onStationClick: (station: StationSummary) => void
  onReady?: () => void
}

export function useKakaoMap({
  stations,
  selectedStation,
  onStationClick,
  onReady,
}: UseKakaoMapOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)
  const markersRef = useRef<kakao.maps.Marker[]>([])
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null))
    overlaysRef.current.forEach((o) => o.setMap(null))
    markersRef.current = []
    overlaysRef.current = []
  }, [])

  const renderMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    clearMarkers()

    const uniqueStations = new Map<string, StationSummary>()
    for (const s of stations) {
      if (!uniqueStations.has(s.stationName)) {
        uniqueStations.set(s.stationName, s)
      }
    }

    uniqueStations.forEach((station) => {
      const position = new kakao.maps.LatLng(station.latitude, station.longitude)
      const color = STATUS_COLORS[station.status]
      const imageSrc = createMarkerSvg(color, 26)
      const imageSize = new kakao.maps.Size(26, 26)
      const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize)

      const marker = new kakao.maps.Marker({
        position,
        map,
        image: markerImage,
        title: station.stationName,
        clickable: true,
        zIndex: station.status === 'broken' ? 3 : 1,
      })

      kakao.maps.event.addListener(marker, 'click', () => {
        onStationClick(station)
      })

      const labelOverlay = new kakao.maps.CustomOverlay({
        position,
        content: `<div style="
          padding:2px 6px;
          background:white;
          border-radius:4px;
          font-size:11px;
          font-weight:600;
          color:#334155;
          box-shadow:0 1px 4px rgba(0,0,0,0.12);
          transform:translate(-50%,-36px);
          white-space:nowrap;
          pointer-events:none;
        ">${station.stationName}</div>`,
        map,
        xAnchor: 0.5,
        yAnchor: 1,
        zIndex: 2,
      })

      if (station.status === 'broken') {
        const brokenElv = station.elevators.find((e) => e.status === 'broken')
        if (brokenElv) {
          const alertOverlay = new kakao.maps.CustomOverlay({
            position,
            content: `<div style="
              padding:4px 8px;
              background:#fef2f2;
              border:1px solid #fecaca;
              border-radius:6px;
              font-size:10px;
              color:#dc2626;
              font-weight:600;
              transform:translate(-50%,-58px);
              white-space:nowrap;
              pointer-events:none;
            ">${brokenElv.learningLabel}</div>`,
            map,
            xAnchor: 0.5,
            yAnchor: 1,
            zIndex: 4,
          })
          overlaysRef.current.push(alertOverlay)
        }
      }

      markersRef.current.push(marker)
      overlaysRef.current.push(labelOverlay)
    })
  }, [stations, onStationClick, clearMarkers])

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
        onReady?.()
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
      clearMarkers()
      mapRef.current = null
    }
  }, [onReady, clearMarkers])

  useEffect(() => {
    if (isMapReady) renderMarkers()
  }, [isMapReady, renderMarkers])

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !selectedStation) return
    const pos = new kakao.maps.LatLng(
      selectedStation.latitude,
      selectedStation.longitude
    )
    mapRef.current.setCenter(pos)
    mapRef.current.setLevel(4)
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
