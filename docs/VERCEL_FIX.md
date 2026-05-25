# Vercel "Pro 업그레이드" / 배포 실패 해결

## 결론: **유료(Pro) 필요 없음**

SafeMetro 부산은 아래 구성이면 **Vercel Hobby(무료)** 만으로 충분합니다.

| 서비스 | 역할 | 플랜 |
|--------|------|------|
| **Vercel** | React 정적 사이트만 (`dist`) | 무료 |
| **Render** | FastAPI + 공공데이터 API | 무료 |

Pro 안내 메일은 **Vercel이 `backend/`(Python)까지 한 프로젝트에서 같이 배포하려 해서** 뜬 경우가 많습니다. (Services / Fluid 모드)

---

## 원인

`vercel link` 실행 시 FastAPI(`backend/`)가 감지되면서 프로젝트가 **`framework: services`** 로 바뀌었습니다.

- 빌드 명령·출력 폴더가 비어 있음 → 배포 실패 (UNKNOWN)
- 대시보드에 **No Production Deployment** 표시
- 예전에 성공한 배포(약 1시간 전)만 `safemetro-busan.vercel.app` 에 연결되어 **링크는 열림**

---

## 해결 (Vercel 대시보드, 3분)

1. https://vercel.com → **safemetro-busan** 프로젝트
2. **Settings** → **General**
3. **Framework Preset** → **`Vite`** (Services / Other 아님)
4. 아래처럼 입력:

| 항목 | 값 |
|------|-----|
| Root Directory | *(비움)* |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

5. **Environment Variables** (Production):

| Key | Value |
|-----|--------|
| `VITE_KAKAO_MAP_KEY` | 카카오 JavaScript 키 |
| `VITE_BACKEND_API_BASE` | Render API URL (예: `https://xxx.onrender.com`) |

`VITE_ODCLOUD_SERVICE_KEY` 는 **삭제** (Render만 사용)

6. **Deployments** → 맨 위 실패 건 무시
7. **Redeploy** → 최근 **Ready** 배포 선택 또는 **Create Deployment** → Branch `main`, **Use existing Build Cache** 끄기

---

## 백엔드는 Vercel에 올리지 않기

- `backend/` → **Render** (`render.yaml`) 만 사용
- Vercel에는 **프론트만** 배포

---

## 성공 확인

- Deployments에 **Production · Ready** (초록)
- `https://safemetro-busan.vercel.app` 접속
- 지도 표시 + (Render 연동 시) 「API 서버 연동」 배지

---

## Pro를 사야 하나?

**아니요.** 대회·시연용이면 Hobby + Render Free로 충분합니다.  
Pro는 팀 규모, 상업용 대역폭, Serverless Function 대량 사용 등이 필요할 때만 고려하세요.
