# SafeMetro 부산

부산교통공사 엘리베이터·대체경로 공공데이터를 활용한 **AI 기반 지하철 접근성 최적 경로 추천** 웹 서비스 (2026 부산광역시 공공데이터·AI 활용 창업경진대회 출품용)

## 기술 스택

- React 19 + Vite 6 + TypeScript
- TailwindCSS
- Zustand
- Kakao Maps SDK

## 프로젝트 구조

```
src/
├── mock/rawElevatorData.ts      # 실제 API 형태 Mock (한글 필드명)
├── transform/transformElevatorData.ts  # 영어 변수명 변환
├── types/elevator.ts            # TypeScript 타입
├── data/index.ts                # 변환된 데이터 export
├── store/useAppStore.ts         # Zustand 상태
├── utils/                       # 추천 알고리즘, 카카오맵 로더
├── hooks/useKakaoMap.ts
├── components/
│   ├── layout/Header.tsx
│   ├── panels/SearchPanel.tsx, ResultPanel.tsx
│   └── map/KakaoMapView.tsx, ...
└── pages/MainPage.tsx
```

## 데이터 파이프라인

```
공공데이터포털 ODcloud API (한글 필드, 932건+)
  → src/api/elevatorApi.ts (페이지네이션 수집)
  → transformElevatorData.ts
  → ElevatorRecord (영어 변수명)
  → React UI / Zustand
```

API 실패 또는 키 미설정 시 `src/mock/rawElevatorData.ts`로 자동 fallback.

## 공공데이터 API 연동

| 항목 | 값 |
|------|-----|
| 데이터명 | 부산교통공사_엘리베이터 고장 시 대체 이동 경로 |
| Base URL | `https://api.odcloud.kr/api` |
| Endpoint | `/15151579/v1/uddi:1bf91dbe-a17f-44aa-9141-a93057b8100f` |
| 인증 | Query `serviceKey` (일반인증키) |
| Swagger | [ODcloud OAS](https://infuser.odcloud.kr/oas/docs?namespace=15151579/v1) |

### 환경 변수

`.env.example`을 복사해 `.env` 생성:

```env
VITE_ODCLOUD_SERVICE_KEY=공공데이터포털_일반인증키
VITE_ODCLOUD_API_BASE=/odcloud-api
VITE_KAKAO_MAP_KEY=카카오_JavaScript_키
```

- **개발**: `VITE_ODCLOUD_API_BASE=/odcloud-api` → Vite 프록시로 CORS 우회
- **배포**: `VITE_ODCLOUD_API_BASE=https://api.odcloud.kr/api` (또는 FastAPI 백엔드 경유 권장)

> 인증키는 Git에 커밋하지 마세요. `.env`는 `.gitignore`에 포함되어 있습니다.

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 공공데이터·카카오맵 키 설정

`.env` 파일:

```env
VITE_ODCLOUD_SERVICE_KEY=발급받은_일반인증키
VITE_ODCLOUD_API_BASE=/odcloud-api
VITE_KAKAO_MAP_KEY=발급받은_JavaScript_키
```

### 3. 카카오맵 도메인 등록

1. [Kakao Developers](https://developers.kakao.com)에서 앱 생성
2. **JavaScript 키** 발급
3. 프로젝트 루트에 `.env` 파일 생성:

```env
VITE_KAKAO_MAP_KEY=발급받은_JavaScript_키
```

> 플랫폼 도메인에 `http://localhost:5173` 등 개발 URL을 등록해야 합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 5. 빌드

```bash
npm run build
npm run preview
```

## 주요 기능

- 카카오맵 기반 역 마커 (정상/부분장애/고장 색상)
- AI 경로 추천 (규칙·가중치 기반)
- 실시간 장애 요약 패널
- 역 마커 클릭 상세 카드
- 반응형 3단 레이아웃

## API 키 없이 실행 시

카카오맵 SDK 로드 실패 시 안내 메시지와 역 목록 fallback UI가 표시됩니다. 지도 기능을 사용하려면 `.env` 설정이 필요합니다.

## FastAPI 백엔드

```bash
cd backend
pip install -r requirements.txt
# backend/.env 에 ODCLOUD_SERVICE_KEY 설정
uvicorn app.main:app --reload --port 8000
```

또는 프론트 루트에서:

```bash
npm run dev:api
```

- `GET /api/v1/elevators?all=true` — 전체 데이터 (한글 필드)
- `GET /api/v1/health` — 헬스체크
- Swagger: http://localhost:8000/docs

프론트는 `VITE_BACKEND_API_BASE=/backend-api` 로 백엔드를 우선 호출합니다.

## 화면 구성

| 탭 | 설명 |
|----|------|
| AI 경로 추천 | 3단 레이아웃 (검색·지도·AI 결과), 모바일 탭 전환 |
| 역별 정보 | 역 검색·호선·상태 필터, 카드 목록 |
| 장애 현황 | 엘리베이터 단위 장애 테이블 |
| 이용 안내 | 사용법·FAQ |

## 배포 (GitHub + Vercel + Render) — 권장

| 서비스 | 역할 |
|--------|------|
| **GitHub** | 소스 저장 · push 시 자동 배포 트리거 |
| **Vercel** | 프론트엔드 (`dist`) · 카카오맵 `VITE_KAKAO_MAP_KEY` |
| **Render** | FastAPI · `ODCLOUD_SERVICE_KEY` (브라우저에 노출 안 됨) |

상세 절차: **[docs/DEPLOY.md](docs/DEPLOY.md)**

**요약 순서**

1. GitHub에 push
2. **Render** — `backend` Web Service, `ODCLOUD_SERVICE_KEY` 설정 → API URL 확보
3. **Vercel** — `VITE_BACKEND_API_BASE` = Render URL 로 배포 → 웹 URL 확보
4. **카카오** — Web 도메인에 Vercel URL 등록 → JavaScript 키 → Vercel 환경 변수 → **Redeploy**
5. **Render** — `CORS_ORIGINS`에 Vercel URL 추가

프로덕션 환경 변수 예시:

```env
# Vercel
VITE_BACKEND_API_BASE=https://safemetro-busan-api.onrender.com
VITE_KAKAO_MAP_KEY=카카오_JavaScript_키

# Render
ODCLOUD_SERVICE_KEY=공공데이터_일반인증키
CORS_ORIGINS=https://safemetro-busan.vercel.app,http://localhost:5173
```

설정 파일: 루트 `vercel.json`, `render.yaml`
