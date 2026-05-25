# GitHub 로그인(gh auth login) 완료 후 실행
# .\scripts\Deploy-After-GitHub.ps1 -RenderUrl "https://xxx.onrender.com" -KakaoKey "카카오키"

param(
  [Parameter(Mandatory = $true)]
  [string]$RenderUrl,
  [string]$KakaoKey = "",
  [string]$RepoName = "safemetro-busan"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$RenderUrl = $RenderUrl.TrimEnd("/")

Write-Host "=== GitHub push ===" -ForegroundColor Cyan
gh auth status
if (-not (git remote get-url origin 2>$null)) {
  gh repo create $RepoName --private --source=. --remote=origin
}
git push -u origin main
$gitUrl = gh repo view --json url -q .url
Write-Host "GitHub: $gitUrl"

Write-Host "=== Render health ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$RenderUrl/api/v1/health" -TimeoutSec 120 | ConvertTo-Json

Write-Host "=== Vercel deploy ===" -ForegroundColor Cyan
if (-not $KakaoKey) { $KakaoKey = "replace_after_kakao_setup" }
$env:VITE_BACKEND_API_BASE = $RenderUrl
$env:VITE_KAKAO_MAP_KEY = $KakaoKey

vercel link --yes 2>$null
"production" | ForEach-Object {
  echo $RenderUrl | vercel env add VITE_BACKEND_API_BASE $_ --force 2>$null
  echo $KakaoKey | vercel env add VITE_KAKAO_MAP_KEY $_ --force 2>$null
}
$deployOutput = vercel --prod --yes 2>&1 | Out-String
Write-Host $deployOutput
if ($deployOutput -match "(https://[^\s]+\.vercel\.app)") {
  $vercelUrl = $Matches[1]
} else {
  $vercelUrl = Read-Host "Vercel URL"
}

Write-Host "`n=== 완료 ===" -ForegroundColor Green
Write-Host "Vercel:  $vercelUrl"
Write-Host "Render:  $RenderUrl"
Write-Host "CORS:    CORS_ORIGINS=$vercelUrl,http://localhost:5173"
Write-Host "Kakao:   Web 도메인에 $vercelUrl 등록 후 VITE_KAKAO_MAP_KEY 업데이트 → vercel --prod"

@{
  github = $gitUrl
  render = $RenderUrl
  vercel = $vercelUrl
  cors   = "$vercelUrl,http://localhost:5173"
} | ConvertTo-Json | Set-Content deploy-info.json -Encoding UTF8
