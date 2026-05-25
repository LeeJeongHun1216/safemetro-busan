import { STATUS_COLORS } from '@/utils/statusColors'
import type { StationSummary } from '@/types/elevator'

const MARKER_DOT_SIZE = 28

export function isValidBusanCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= 34.8 &&
    lat <= 35.5 &&
    lng >= 128.5 &&
    lng <= 129.5
  )
}

/** API에서 위·경도가 뒤바뀐 경우 보정 */
export function resolveStationCoords(
  latitude: number,
  longitude: number
): { latitude: number; longitude: number } | null {
  if (isValidBusanCoord(latitude, longitude)) {
    return { latitude, longitude }
  }
  if (isValidBusanCoord(longitude, latitude)) {
    return { latitude: longitude, longitude: latitude }
  }
  return null
}

export function createStationMarkerElement(
  station: StationSummary,
  onClick: () => void
): HTMLElement {
  const color = STATUS_COLORS[station.status]
  const root = document.createElement('div')
  root.setAttribute('role', 'button')
  root.setAttribute('aria-label', `${station.stationName} 역`)
  root.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;'

  const dot = document.createElement('div')
  dot.style.cssText = [
    `width:${MARKER_DOT_SIZE}px`,
    `height:${MARKER_DOT_SIZE}px`,
    `background:${color}`,
    'border:3px solid #fff',
    'border-radius:50%',
    'box-shadow:0 2px 8px rgba(15,23,42,0.35)',
  ].join(';')
  root.appendChild(dot)

  const label = document.createElement('div')
  label.textContent = station.stationName
  label.style.cssText = [
    'margin-top:4px',
    'padding:2px 8px',
    'background:#fff',
    'border-radius:6px',
    'font-size:11px',
    'font-weight:700',
    'color:#334155',
    'white-space:nowrap',
    'box-shadow:0 1px 4px rgba(15,23,42,0.12)',
    'line-height:1.3',
  ].join(';')
  root.appendChild(label)

  if (station.status === 'broken') {
    const brokenElv = station.elevators.find((e) => e.status === 'broken')
    if (brokenElv) {
      const alert = document.createElement('div')
      alert.textContent = brokenElv.learningLabel
      alert.style.cssText = [
        'margin-bottom:4px',
        'padding:3px 8px',
        'background:#fef2f2',
        'border:1px solid #fecaca',
        'border-radius:6px',
        'font-size:10px',
        'font-weight:600',
        'color:#dc2626',
        'white-space:nowrap',
        'max-width:160px',
        'overflow:hidden',
        'text-overflow:ellipsis',
      ].join(';')
      root.insertBefore(alert, dot)
    }
  }

  root.addEventListener('click', (e) => {
    e.stopPropagation()
    onClick()
  })

  return root
}
