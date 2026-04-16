# 사내 이전용 파일 추출 스크립트
# 사용법: .\export.ps1

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$exportDir = "some-cleaner_$timestamp"
$exportZip = "$exportDir.zip"

# 제외할 폴더
$excludes = @("node_modules", "dist", ".git", ".github", $exportDir)

Write-Host "📦 사내 이전용 패키지를 생성합니다..." -ForegroundColor Cyan

# 임시 폴더에 복사 (폴더 구조 유지)
New-Item -ItemType Directory -Path $exportDir | Out-Null

Get-ChildItem -Path "." -Recurse | Where-Object {
  $item = $_
  $exclude = $false
  foreach ($ex in $excludes) {
    if ($item.FullName -match [regex]::Escape("\$ex")) {
      $exclude = $true
      break
    }
  }
  -not $exclude -and -not $item.PSIsContainer
} | ForEach-Object {
  $dest = $_.FullName -replace [regex]::Escape((Get-Location).Path), $exportDir
  $destDir = Split-Path $dest -Parent
  if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
  }
  Copy-Item $_.FullName -Destination $dest
}

# zip 압축
Compress-Archive -Path "$exportDir\*" -DestinationPath $exportZip

# 임시 폴더 삭제
Remove-Item -Recurse -Force $exportDir

$size = [math]::Round((Get-Item $exportZip).Length / 1KB, 0)

Write-Host ""
Write-Host "✅ 완료: $exportZip ($size KB)" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Yellow
Write-Host "  1. $exportZip 을 사내 PC로 복사"
Write-Host "  2. 압축 해제 후 .env.production 파일 생성"
Write-Host "     VITE_USE_MOCK=false"
Write-Host "     VITE_API_URL=http://사내-api-주소"
Write-Host "  3. npm install  (폐쇄망이면 생략)"
Write-Host "  4. npm run build"
