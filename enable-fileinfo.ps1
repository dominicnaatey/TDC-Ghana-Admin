$ini = 'C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.ini'
$dir = Split-Path $ini -Parent

if (-not (Test-Path $ini)) {
  $prod = Join-Path $dir 'php.ini-production'
  $dev = Join-Path $dir 'php.ini-development'
  if (Test-Path $prod) {
    Copy-Item $prod $ini -Force
  } elseif (Test-Path $dev) {
    Copy-Item $dev $ini -Force
  } else {
    Write-Error 'php.ini not found and no template available.'
    exit 1
  }
}

$lines = Get-Content -Path $ini
$hasFileinfo = $false
foreach ($line in $lines) {
  if ($line -match '^\s*;?\s*extension\s*=\s*(php_)?fileinfo(\.dll)?\s*$') {
    $hasFileinfo = $true
    break
  }
}

if (-not $hasFileinfo) {
  Add-Content -Path $ini -Value 'extension=fileinfo'
  Write-Output 'Enabled: extension=fileinfo'
} else {
  # If present but commented, uncomment
  $updated = $lines | ForEach-Object {
    if ($_ -match '^\s*;\s*extension\s*=\s*(php_)?fileinfo(\.dll)?\s*$') { $_ -replace '^\s*;\s*', '' } else { $_ }
  }
  Set-Content -Path $ini -Value $updated
  Write-Output 'Verified: fileinfo extension already present.'
}

Write-Output "php.ini updated at: $ini"