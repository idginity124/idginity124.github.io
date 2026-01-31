# build.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"

# dist'i temizle
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null

# her şeyi dist'e kopyala (git klasörü vs hariç)
robocopy $root $dist /E /XD ".git" "node_modules" "dist" | Out-Null

# CSS minify
npx cleancss -o "$dist\assets\styles.min.css" "$dist\assets\styles.css"

# JS minify/obfuscate (terser ile)
npx terser "$dist\assets\app.js" -c -m -o "$dist\assets\app.min.js"
npx terser "$dist\assets\fx.js"  -c -m -o "$dist\assets\fx.min.js"

# HTML dosyalarında referansları .min'e çevir
Get-ChildItem -Path $dist -Filter *.html -Recurse | ForEach-Object {
  $p = $_.FullName
  $c = Get-Content $p -Raw

  $c = $c -replace 'assets/styles\.css', 'assets/styles.min.css'
  $c = $c -replace 'assets/app\.js', 'assets/app.min.js'
  $c = $c -replace 'assets/fx\.js', 'assets/fx.min.js'

  Set-Content -Path $p -Value $c -Encoding UTF8
}

# (Opsiyonel) HTML minify (istersen aç)
# Get-ChildItem -Path $dist -Filter *.html -Recurse | ForEach-Object {
#   npx html-minifier-terser $_.FullName -o $_.FullName `
#     --collapse-whitespace --remove-comments --minify-css true --minify-js true
# }

Write-Host "OK -> dist klasörü hazır."
