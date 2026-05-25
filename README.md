# SafeMetro 부산

부산교통공사 **엘리베이터 고장 시 대체 이동 경로** 공공데이터를 활용한 부산 지하철 **접근성·경로 추천** 웹 서비스입니다.

**프로덕션:** https://safemetro-busan.vercel.app

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트 | React 19, Vite 6, TypeScript, TailwindCSS |
| 상태 | Zustand |
| 지도 | Kakao Maps JavaScript SDK |
| API | ODcloud(공공데이터포털), 선택적 FastAPI 프록시(Render) |

## 주요 기능

- **AI 경로 추천** — 최단 경로 vs 접근성 우선 추천, 「왜 이 경로인가요?」 설명, 예상 소요 시간
- **지도** — 1~4호선 상징색 마커, 환승역 단일 마커, 추천(실선)·최단(점선) 경로 표시
- **실시간 장애 요약** — 중복 안내 통합 집계(검색 패널·상단 배너·장애 현황 동일 기준)
- **데이터 새로고침** — 마지막 갱신 시각, 수동 갱신, 고장·일부 장애 알림 배너
- **역별 정보** — 역·호선·상태 필터, 대체 경로 요약 카드
- **장애 현황** — 엘리베이터·경로 단위 상세 테이블
- **즐겨찾기** — 출발역 로컬 저장(브라우저)

## 프로젝트 구조

```
src/
├── api/                    # ODcloud·백엔드 프록시
├── data/
│   ├── loadElevatorData.ts # API/Mock 로드
│   └── prepareElevatorRecords.ts
├── transform/transformElevatorData.ts
├── utils/
│   ├── elevatorDisplay.ts  # 중복 제거·표시 문구
│   ├── routeRecommendation.ts
│   ├── routeMapPath.ts
│   ├── stationCoordinateFix.ts
│   ├── mergeMapMarkers.ts
│   └── metroGraph.ts
├── store/useAppStore.ts
├── hooks/useKakaoMap.ts
├── views/                  # Route, Stations, Status, Guide
├── components/             # layout, panels, map
└── pages/MainPage.tsx
backend/                    # FastAPI (Render 배포용)
```

## 데이터 파이프라인

```
ODcloud API 또는 Render 백엔드 (/api/v1/elevators)
  → prepareElevatorRecords (변환 + 3호선 좌표 보정)
  → groupByStation (역명::호선)
  → computeStatusCounts (중복 안내 통합 집계)
  → Zustand → UI / 경로 추천 / 지도
```

API·키 미설정 시 `src/mock/rawElevatorData.ts`로 fallback.

## 환경 변수

`.env.example`을 복사해 `.env` 생성:

```env
# 공공데이터 (개발: Vite 프록시)
VITE_ODCLOUD_SERVICE_KEY=일반인증키
VITE_ODCLOUD_API_BASE=/odcloud-api

# 카카오맵
VITE_KAKAO_MAP_KEY=JavaScript_키

# 선택: Render FastAPI (프로덕션 권장)
VITE_BACKEND_API_BASE=https://your-api.onrender.com
```

- **개발:** `VITE_ODCLOUD_API_BASE=/odcloud-api`, `VITE_BACKEND_API_BASE=/backend-api`
- **프로덕션:** 백엔드 URL + 카카오 키만 Vercel에 설정(인증키는 Render에만)

인증키는 Git에 커밋하지 마세요.

## 로컬 실행

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # dist
npm run preview
```

카카오 Developers에 `http://localhost:5173` 도메인 등록이 필요합니다.

백엔드(선택):

```bash
cd backend
pip install -r requirements.txt
# backend/.env: ODCLOUD_SERVICE_KEY
uvicorn app.main:app --reload --port 8000
```

또는 `npm run dev:api` (프론트와 동시에 프록시 연동).

## 화면 구성

| 탭 | 설명 |
|----|------|
| AI 경로 추천 | 검색·지도·결과(경로 비교·상세), 모바일 하단 탭 전환 |
| 역별 정보 | 역 검색·호선·상태 필터 |
| 장애 현황 | 중복 제거된 엘리베이터·경로 목록 |
| 이용 안내 | 사용법·FAQ |

## 배포

| 서비스 | 역할 |
|--------|------|
| GitHub | 소스 · push 시 자동 배포 |
| Vercel | 프론트 `dist`, `VITE_KAKAO_MAP_KEY`, `VITE_BACKEND_API_BASE` |
| Render | FastAPI, `ODCLOUD_SERVICE_KEY`, `CORS_ORIGINS` |

상세: **[docs/DEPLOY.md](docs/DEPLOY.md)** · Vercel 차단 시 **[docs/VERCEL_FIX.md](docs/VERCEL_FIX.md)**

**요약**

1. GitHub `main`에 push
2. Render Web Service(`backend`) + `ODCLOUD_SERVICE_KEY`
3. Vercel + `VITE_BACKEND_API_BASE` = Render URL
4. 카카오 Web 도메인에 Vercel URL 등록 → `VITE_KAKAO_MAP_KEY` → Redeploy
5. Render `CORS_ORIGINS`에 Vercel URL 추가

## 공공데이터

| 항목 | 값 |
|------|-----|
| 데이터명 | 부산교통공사_엘리베이터 고장 시 대체 이동 경로 |
| Endpoint | `/15151579/v1/uddi:1bf91dbe-a17f-44aa-9141-a93057b8100f` |
| Swagger | [ODcloud OAS](https://infuser.odcloud.kr/oas/docs?namespace=15151579/v1) |

## 라이선스·면책

공공데이터 기반이며, 실제 시설·운행과 차이가 있을 수 있습니다. 긴급 상황은 역무원·교통공사 안내를 우선하세요.
