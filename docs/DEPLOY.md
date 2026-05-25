# 배포 가이드: GitHub + Vercel + Render

SafeMetro 부산은 **프론트(Vercel)** + **API(Render)** + **GitHub 자동 배포** 구성을 권장합니다.

```
GitHub push
    ├─► Vercel  → https://safemetro-busan.vercel.app  (React)
    └─► Render  → https://safemetro-busan-api.onrender.com  (FastAPI)
```

---

## 왜 Vercel + Render인가?

| | Vercel | Render |
|---|--------|--------|
| 역할 | Vite/React 정적·SSR 호스팅 | FastAPI 상시(또는 슬립) API |
| GitHub 연동 | ✅ 자동 배포 | ✅ 자동 배포 |
| HTTPS | ✅ | ✅ |
| 공공데이터 키 | ❌ 넣지 않음 | ✅ 서버 환경 변수만 |
| 카카오맵 키 | ✅ `VITE_KAKAO_MAP_KEY` (빌드 시 주입) | — |

> Render 무료 플랜은 15분 미사용 시 슬립 → 첫 API 호출 시 30초~1분 대기 가능. 대회 시연 전에 한 번 접속해 워밍업하세요.

---

## 0. 사전 준비

1. [GitHub](https://github.com) 계정
2. [Vercel](https://vercel.com) — GitHub 로그인
3. [Render](https://render.com) — GitHub 로그인
4. 로컬에서 `.env` / `backend/.env`는 **커밋하지 않기** (이미 `.gitignore` 처리됨)

```bash
git init
git add .
git commit -m "Initial commit: SafeMetro Busan"
git remote add origin https://github.com/YOUR_ID/safemetro-busan.git
git push -u origin main
```

---

## 1. Render (백엔드) — 먼저 배포

### 방법 A: Blueprint (`render.yaml`)

1. Render 대시보드 → **New +** → **Blueprint**
2. GitHub 저장소 연결
3. `render.yaml` 인식 후 **Apply**
4. `ODCLOUD_SERVICE_KEY`만 대시보드에서 수동 입력 (sync: false)

### 방법 B: Web Service 수동

| 항목 | 값 |
|------|-----|
| Environment | Python 3 |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/v1/health` |

**Environment Variables**

| Key | Value |
|-----|--------|
| `ODCLOUD_SERVICE_KEY` | 공공데이터포털 일반인증키 |
| `ODCLOUD_API_BASE` | `https://api.odcloud.kr/api` |
| `CORS_ORIGINS` | `http://localhost:5173` (Vercel URL은 나중에 추가) |

배포 완료 후 API URL 복사:

`https://safemetro-busan-api.onrender.com`

브라우저에서 확인:

- `https://YOUR-API.onrender.com/api/v1/health` → `{"status":"ok",...}`

---

## 2. Vercel (프론트) — 두 번째 배포

1. Vercel → **Add New Project** → GitHub 저장소 Import
2. Framework Preset: **Vite** (자동 감지)
3. Root Directory: `.` (프로젝트 루트)
4. Build / Output: `vercel.json` 참고 (`dist`)

**Environment Variables** (Production)

| Key | Value |
|-----|--------|
| `VITE_BACKEND_API_BASE` | `https://safemetro-busan-api.onrender.com` (Render URL, 끝에 `/` 없이) |
| `VITE_KAKAO_MAP_KEY` | 카카오 JavaScript 키 (3단계에서 등록 후 입력) |

5. **Deploy** → URL 확인: `https://safemetro-busan.vercel.app`

> `VITE_` 변수는 **빌드할 때** 박히므로, 키 변경 후에는 Vercel에서 **Redeploy** 필요합니다.

---

## 3. 카카오맵 키 (배포 URL 확정 후)

1. [Kakao Developers](https://developers.kakao.com) → 내 애플리케이션
2. **플랫폼 → Web** → 사이트 도메인 등록  
   - `https://safemetro-busan.vercel.app`  
   - 개발용: `http://localhost:5173`
3. **앱 키 → JavaScript 키** 복사
4. Vercel → Project → Settings → Environment Variables  
   - `VITE_KAKAO_MAP_KEY` = JavaScript 키  
5. **Deployments → Redeploy** (재빌드 필수)

---

## 4. CORS 마무리 (Render)

Vercel URL이 나온 뒤 Render 환경 변수 수정:

```
CORS_ORIGINS=https://safemetro-busan.vercel.app,http://localhost:5173
```

저장 시 Render가 자동 재배포합니다.

---

## 5. 동작 확인 체크리스트

- [ ] Vercel 사이트 로딩
- [ ] 좌측 패널 **「API 서버 연동」** 배지
- [ ] 장애 요약 숫자가 수백 건 규모 (Mock이 아닌 실데이터)
- [ ] 카카오 지도 표시
- [ ] AI 경로 추천 동작
- [ ] Render `/docs` Swagger 열림

---

## 배포 순서 요약 (한 줄)

**GitHub push → Render(API URL) → Vercel(백엔드 URL 넣고 배포) → 카카오에 Vercel URL 등록 → 카카오 키 Vercel에 넣고 Redeploy → Render CORS에 Vercel URL 추가**

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| 지도 안 됨 | 카카오 Web 도메인 = Vercel URL 정확히 일치? `VITE_KAKAO_MAP_KEY` 재배포? |
| API CORS 오류 | Render `CORS_ORIGINS`에 Vercel URL 포함 여부 |
| API 느림 | Render free 슬립 → 시연 전 health URL 한 번 호출 |
| Mock 데이터만 보임 | `VITE_BACKEND_API_BASE` 오타, Render 서비스 다운 |

---

## 커스텀 도메인 (선택)

- Vercel: `safemetro.kr` 등 연결 가능
- 연결 후 **카카오 Web 도메인**과 **Render CORS**를 새 도메인으로 다시 등록
