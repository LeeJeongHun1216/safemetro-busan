const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

let loadPromise: Promise<void> | null = null

export function loadKakaoMapScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.kakao?.maps) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined

  if (!appKey || appKey === 'your_kakao_javascript_key_here') {
    return Promise.reject(
      new Error(
        'VITE_KAKAO_MAP_KEY가 설정되지 않았습니다. .env 파일에 카카오 JavaScript 키를 추가해주세요.'
      )
    )
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src^="${KAKAO_SDK_URL}"]`
    )
    if (existing) {
      window.kakao.maps.load(() => resolve())
      return
    }

    const script = document.createElement('script')
    script.src = `${KAKAO_SDK_URL}?appkey=${appKey}&autoload=false`
    script.async = true
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'))
    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
