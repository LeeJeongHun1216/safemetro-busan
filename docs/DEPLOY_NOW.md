# 지금 바로 배포하기 (2분 인증 + 스크립트)

아래 **① 인증 2개**만 브라우저에서 완료한 뒤, **② 한 줄 명령**으로 나머지가 진행됩니다.

---

## ① 브라우저 인증 (필수, 1회)

PowerShell에서 각각 실행 후 화면 안내에 따라 로그인:

```powershell
cd "c:\Users\이정훈\Desktop\SafeMetro 부산"

# GitHub
gh auth login -h github.com -p https -w

# Vercel
vercel login
```

---

## ② Render 백엔드 (5분)

1. https://dashboard.render.com/blueprints
2. **New Blueprint Instance** → GitHub `safemetro-busan` 선택
3. Environment Variables:
   - `ODCLOUD_SERVICE_KEY` = `backend\.env`에 있는 키
4. 배포 완료 후 URL 복사 (예: `https://safemetro-busan-api.onrender.com`)
5. Health 확인: `https://YOUR-API.onrender.com/api/v1/health`

---

## ③ 자동 배포 스크립트 (GitHub push + Vercel)

Render URL을 알게 된 뒤:

```powershell
.\scripts\Deploy-After-GitHub.ps1 -RenderUrl "https://safemetro-busan-api.onrender.com" -KakaoKey ""
```

카카오 키는 아직 없으면 `-KakaoKey ""` 로 두고, Vercel 배포 후 카카오에서 키 발급 → Vercel 환경 변수 수정 → `vercel --prod`

---

## ④ 카카오맵 (Vercel URL 확정 후)

1. https://developers.kakao.com → Web 플랫폼
2. 사이트 도메인: `https://xxxx.vercel.app`
3. JavaScript 키 → Vercel → Settings → Environment Variables → `VITE_KAKAO_MAP_KEY`
4. `vercel --prod`

---

## ⑤ Render CORS

Render Dashboard → Environment:

```
CORS_ORIGINS=https://xxxx.vercel.app,http://localhost:5173
```

---

## 전체 자동 (인증 완료 후)

```powershell
.\scripts\Deploy-Full.ps1
```

대화형으로 Render URL·카카오 키를 물어봅니다.
