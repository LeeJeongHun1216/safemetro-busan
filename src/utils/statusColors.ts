import type { ElevatorStatus } from '@/types/elevator'

export const STATUS_COLORS: Record<ElevatorStatus, string> = {
  normal: '#22c55e',
  partial: '#f97316',
  broken: '#ef4444',
}

export const STATUS_LABELS: Record<ElevatorStatus, string> = {
  normal: '정상',
  partial: '일부 장애',
  broken: '고장',
}

/** 부산 지하철 공식 상징색 */
export const LINE_COLORS: Record<number, string> = {
  1: '#F06A00',
  2: '#81BF48',
  3: '#BB8C00',
  4: '#217DCB',
}

export function getLineColor(lineNumber: number): string {
  return LINE_COLORS[lineNumber] ?? '#64748b'
}

export function createMarkerSvg(color: string, size = 28): string {
  const r = size / 2 - 2
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" stroke="white" stroke-width="2.5"/>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`
}
