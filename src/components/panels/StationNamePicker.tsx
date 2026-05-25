import { useEffect, useMemo, useRef, useState } from 'react'

interface StationNamePickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  stationNames: string[]
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function StationNamePicker({
  label,
  value,
  onChange,
  stationNames,
  isFavorite,
  onToggleFavorite,
}: StationNamePickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const filteredNames = useMemo(() => {
    const query = value.trim().toLowerCase()
    if (!query) return stationNames
    return stationNames.filter((name) => name.toLowerCase().includes(query))
  }, [value, stationNames])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selectStation = (name: string) => {
    onChange(name)
    setOpen(false)
  }

  return (
    <div ref={rootRef}>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative flex gap-1.5">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="역명을 입력하세요"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            className={`flex h-[42px] w-10 shrink-0 items-center justify-center rounded-xl border text-base transition ${
              isFavorite
                ? 'border-amber-300 bg-amber-50 text-amber-500'
                : 'border-slate-200 bg-white text-slate-400 hover:border-amber-200 hover:text-amber-500'
            }`}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>

      {open && stationNames.length > 0 && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
          <p className="mb-2 text-[10px] font-medium text-slate-500">
            역 선택 ({filteredNames.length}개)
          </p>
          {filteredNames.length === 0 ? (
            <p className="py-2 text-center text-xs text-slate-400">
              일치하는 역이 없습니다
            </p>
          ) : (
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto sm:max-h-44">
              {filteredNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => selectStation(name)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    value === name
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
