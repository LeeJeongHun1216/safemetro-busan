/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_KAKAO_MAP_KEY: string
  readonly VITE_BACKEND_API_BASE: string
  readonly VITE_ODCLOUD_SERVICE_KEY: string
  readonly VITE_ODCLOUD_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
