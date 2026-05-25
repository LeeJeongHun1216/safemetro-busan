import { getLineColor } from '@/utils/statusColors'
import { createSamtaegukSvg } from '@/utils/samtaegukMarker'
import type { StationSummary } from '@/types/elevator'

const LINE_MARKER_SIZE = 28
const TRANSFER_MARKER_SIZE = 34

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

function appendStationLabel(root: HTMLElement, stationName: string) {
  const label = document.createElement('div')
  label.textContent = stationName
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
}

export function createStationMarkerElement(
  station: StationSummary,
  onClick: () => void
): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('role', 'button')
  root.setAttribute(
    'aria-label',
    `${station.stationName} 역${station.isTransferStation ? ' 환승' : ''}`
  )
  root.style.cssText =
    'display:flex;flex-direction:column;align-items:center;cursor:pointer;user-select:none;'

  if (station.isTransferStation) {
    const sam = document.createElement('div')
    sam.innerHTML = createSamtaegukSvg(TRANSFER_MARKER_SIZE)
    sam.style.cssText = [
      `width:${TRANSFER_MARKER_SIZE}px`,
      `height:${TRANSFER_MARKER_SIZE}px`,
      'flex-shrink:0',
      'border-radius:50%',
      'overflow:hidden',
      'filter:drop-shadow(0 2px 8px rgba(15,23,42,0.35))',
    ].join(';')
    root.appendChild(sam)
  } else {
    const color = getLineColor(station.lineNumber)
    const dot = document.createElement('div')
    dot.style.cssText = [
      `width:${LINE_MARKER_SIZE}px`,
      `height:${LINE_MARKER_SIZE}px`,
      `background:${color}`,
      'border:3px solid #fff',
      'border-radius:50%',
      'box-shadow:0 2px 8px rgba(15,23,42,0.35)',
    ].join(';')
    root.appendChild(dot)
  }

  appendStationLabel(root, station.stationName)

  root.addEventListener('click', (e) => {
    e.stopPropagation()
    onClick()
  })

  return root
}
