import type { ElevatorRecord } from '@/types/elevator'

function normalizeText(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase()
}

/** 카드에 표시할 한 줄 문구 (중복 판별용) */
export function elevatorDisplayText(elv: ElevatorRecord): string {
  const parts = [`${elv.elevatorInternalNo}호기`, elv.learningLabel.trim()]
  if (shouldShowAlternativeRoute(elv.learningLabel, elv.alternativeRoute)) {
    parts.push(`대체: ${elv.alternativeRoute.trim()}`)
  }
  return parts.filter(Boolean).join(' · ')
}

export function shouldShowAlternativeRoute(
  learningLabel: string,
  alternativeRoute: string
): boolean {
  const alt = alternativeRoute.trim()
  if (!alt) return false
  const labelNorm = normalizeText(learningLabel)
  const altNorm = normalizeText(alt)
  if (labelNorm.includes(altNorm)) return false
  if (altNorm.includes('대체') && labelNorm.includes('대체')) return false
  return true
}

/** 동일 안내 문구는 한 번만 표시 */
export function getDistinctElevatorEntries(
  elevators: ElevatorRecord[],
  limit = 5
): ElevatorRecord[] {
  const seen = new Set<string>()
  const result: ElevatorRecord[] = []

  for (const elv of elevators) {
    const key = elevatorDisplayText(elv)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(elv)
    if (result.length >= limit) break
  }

  return result
}
