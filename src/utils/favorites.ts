const STORAGE_KEY = 'safemetro-favorite-stations'

export function loadFavoriteStations(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is string => typeof v === 'string' && v.length > 0)
  } catch {
    return []
  }
}

export function saveFavoriteStations(names: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(names))
}
