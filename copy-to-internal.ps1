# 사내 이전용 파일 복사 스크립트
# 사용법: .\copy-to-internal.ps1 -Source "C:\다운로드\some-cleaner-main" -Target "C:\projects\some-cleaner"

param(
  [Parameter(Mandatory=$true)]
  [string]$Source,

  [Parameter(Mandatory=$true)]
  [string]$Target
)

# 복사할 항목 목록
$includes = @(
  "src",
  "public",
  "index.html",
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "tailwind.config.ts",
  "postcss.config.js",
  "components.json",
  "tsconfig.json",
  "tsconfig.app.json",
  "tsconfig.node.json",
  "eslint.config.js"
)

# Source 경로 확인
if (-not (Test-Path $Source)) {
  Write-Host "❌ Source 폴더를 찾을 수 없습니다: $Source" -ForegroundColor Red
  exit 1
}

# Target 폴더 생성
New-Item -ItemType Directory -Path $Target -Force | Out-Null

Write-Host "📂 복사 시작..." -ForegroundColor Cyan
Write-Host "   Source: $Source"
Write-Host "   Target: $Target"
Write-Host ""

foreach ($item in $includes) {
  $srcPath = Join-Path $Source $item
  $dstPath = Join-Path $Target $item

  if (Test-Path $srcPath) {
    Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force
    Write-Host "  ✅ $item" -ForegroundColor Green
  } else {
    Write-Host "  ⚠️  $item (없음, 건너뜀)" -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "✅ 복사 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "  1. $Target\.env.production 파일 생성"
Write-Host "     VITE_USE_MOCK=false"
Write-Host "     VITE_API_URL=http://사내-api-주소"
Write-Host "  2. cd $Target"
Write-Host "  3. npm install"
Write-Host "  4. npm run build"
