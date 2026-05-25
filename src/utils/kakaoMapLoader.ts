const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js'

let loadPromise: Promise<void> | null = null

export function loadKakaoMapScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.kakao?.maps) {
    return Promise.resolve()
  }

  if (loadPromise) return loadPromise

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined

  const invalidKeys = [
    'your_kakao_javascript_key_here',
    'placeholder',
    'placeholder_set_in_vercel_dashboard',
    'replace_after_kakao_setup',
  ]
  if (!appKey || invalidKeys.includes(appKey)) {
    return Promise.reject(
      new Error(
        'VITE_KAKAO_MAP_KEY가 유효하지 않습니다. Vercel 환경 변수 설정 후 Redeploy(재배포)가 필요합니다.'
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
    script.onerror = () =>
      reject(
        new Error(
          '카카오맵 SDK 로드 실패. Kakao Developers → 플랫폼 → Web에 https://safemetro-busan.vercel.app 도메인이 등록되었는지 확인해주세요.'
        )
      )
    script.onload = () => {
      window.kakao.maps.load(() => resolve())
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
