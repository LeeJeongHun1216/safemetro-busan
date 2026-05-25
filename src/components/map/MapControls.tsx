interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-medium text-slate-700 shadow-card hover:bg-slate-50"
        aria-label="확대"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-medium text-slate-700 shadow-card hover:bg-slate-50"
        aria-label="축소"
      >
        −
      </button>
      <button
        type="button"
        onClick={onReset}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm shadow-card hover:bg-slate-50"
        aria-label="현재 위치"
      >
        ⊙
      </button>
    </div>
  )
}
