# SafeMetro 부산 — GitHub + Render + Vercel 배포 자동화
# 사용법: PowerShell에서 .\scripts\Deploy-Full.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Write-Step($n, $msg) { Write-Host "`n=== [$n] $msg ===" -ForegroundColor Cyan }
function Require-Cmd($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "필수 명령어 없음: $name"
  }
}

Write-Host "SafeMetro 부산 배포 스크립트" -ForegroundColor Green
Write-Host "프로젝트: $Root"

# ── 1. Git 커밋 ─────────────────────────────────────────────
Write-Step 1 "Git 저장소 확인"
Require-Cmd git
if (-not (Test-Path ".git")) { git init; git branch -M main }
$status = git status --porcelain
if ($status) {
  git add -A
  git commit -m "chore: deploy preparation $(Get-Date -Format 'yyyy-MM-dd')"
}
Write-Host "Git OK — branch: $(git branch --show-current)"

# ── 2. GitHub ─────────────────────────────────────────────
Write-Step 2 "GitHub 저장소 생성 및 push"
Require-Cmd gh
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "GitHub 로그인이 필요합니다. 브라우저가 열리면 로그인을 완료하세요." -ForegroundColor Yellow
  gh auth login -h github.com -p https -w
}

$RepoName = "safemetro-busan"
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
  $user = (gh api user -q .login)
  Write-Host "저장소 생성: $user/$RepoName (private)"
  gh repo create $RepoName --private --source=. --remote=origin --push
} else {
  Write-Host "remote 존재: $remoteUrl"
  git push -u origin main
}
$GitHubRepo = (gh repo view --json url -q .url)
Write-Host "GitHub: $GitHubRepo" -ForegroundColor Green

# ── 3. Render (Blueprint 안내) ────────────────────────────
Write-Step 3 "Render 백엔드"
Write-Host @"
Render는 API 키 또는 대시보드 연동이 필요합니다.

[자동] Blueprint 연결:
  1. https://dashboard.render.com/blueprints
  2. New Blueprint Instance → GitHub repo 선택
  3. render.yaml 적용
  4. Environment → ODCLOUD_SERVICE_KEY 입력 (backend/.env 참고)

[수동] Web Service:
  Root Directory: backend
  Start: uvicorn app.main:app --host 0.0.0.0 --port `$PORT
"@ -ForegroundColor Yellow

$openRender = Read-Host "Render Blueprint 페이지를 브라우저에서 열까요? (Y/n)"
if ($openRender -ne "n") {
  Start-Process "https://dashboard.render.com/blueprints"
}

$RenderUrl = Read-Host "배포 완료 후 Render API URL 입력 (예: https://safemetro-busan-api.onrender.com)"
if (-not $RenderUrl) { throw "Render URL이 필요합니다." }
$RenderUrl = $RenderUrl.TrimEnd("/")

# health check
try {
  $health = Invoke-RestMethod -Uri "$RenderUrl/api/v1/health" -TimeoutSec 120
  Write-Host "Render health: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
  Write-Warning "Render health 확인 실패 (슬립 중일 수 있음). URL을 다시 확인하세요."
}

# ── 4. Vercel ─────────────────────────────────────────────
Write-Step 4 "Vercel 프론트엔드"
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "Vercel CLI 설치 중..."
  npm install -g vercel@latest
}

$KakaoKey = Read-Host "카카오 JavaScript 키 (아직 없으면 Enter → 나중에 Vercel 대시보드에서 설정)"
if (-not $KakaoKey) { $KakaoKey = "placeholder_set_in_vercel_dashboard" }

$env:VITE_BACKEND_API_BASE = $RenderUrl
$env:VITE_KAKAO_MAP_KEY = $KakaoKey

Write-Host "Vercel 로그인 (최초 1회)..."
vercel login

Write-Host "프로덕션 배포 중..."
vercel link --yes 2>$null
vercel env rm VITE_BACKEND_API_BASE production -y 2>$null
vercel env rm VITE_KAKAO_MAP_KEY production -y 2>$null
echo $RenderUrl | vercel env add VITE_BACKEND_API_BASE production
echo $KakaoKey | vercel env add VITE_KAKAO_MAP_KEY production
vercel --prod --yes

$VercelUrl = (vercel ls --yes 2>$null | Select-Object -First 1)
# parse from vercel inspect
$inspect = vercel inspect --yes 2>&1 | Out-String
if ($inspect -match "https://[^\s]+\.vercel\.app") {
  $VercelUrl = $Matches[0]
}
if (-not $VercelUrl) {
  $VercelUrl = Read-Host "Vercel 배포 URL 입력 (예: https://safemetro-busan.vercel.app)"
}

Write-Host "Vercel: $VercelUrl" -ForegroundColor Green

# ── 5. 카카오 ─────────────────────────────────────────────
Write-Step 5 "카카오 Developers"
Write-Host @"
1. https://developers.kakao.com → 앱 → 플랫폼 → Web
2. 사이트 도메인 등록: $VercelUrl
3. JavaScript 키 → Vercel Environment Variables → Redeploy
"@ -ForegroundColor Yellow
Start-Process "https://developers.kakao.com"

# ── 6. Render CORS ────────────────────────────────────────
Write-Step 6 "Render CORS 설정"
Write-Host "Render Dashboard → safemetro-busan-api → Environment:" -ForegroundColor Yellow
Write-Host "CORS_ORIGINS=$VercelUrl,http://localhost:5173"

# 저장
$deployInfo = @{
  github   = $GitHubRepo
  render   = $RenderUrl
  vercel   = $VercelUrl
  cors     = "$VercelUrl,http://localhost:5173"
  deployedAt = (Get-Date).ToString("o")
} | ConvertTo-Json -Depth 3

$deployInfo | Set-Content "deploy-info.json" -Encoding UTF8
Write-Host "`n배포 정보 저장: deploy-info.json" -ForegroundColor Green
Write-Host "완료! 사이트: $VercelUrl" -ForegroundColor Green
