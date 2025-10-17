# Enable PDO SQLite extensions in php.ini for Winget PHP install
$ini = 'C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.ini'
$phpExe = 'C:\Users\HP\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.4_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe'

if (-not (Test-Path $ini)) {
  Write-Error "php.ini not found at: $ini"
  exit 1
}

$iniContent = Get-Content -Path $ini -Raw

# Ensure extension lines exist and are enabled
$extensions = @('pdo_sqlite', 'sqlite3')
$changed = $false
foreach ($ext in $extensions) {
  $pattern = "(?m)^\s*;?\s*extension\s*=\s*${ext}\s*$"
  if ($iniContent -match $pattern) {
    # Uncomment existing line
    $iniContent = [regex]::Replace($iniContent, $pattern, "extension=$ext")
    $changed = $true
  } else {
    # Append the extension directive
    $iniContent += "`r`nextension=$ext"
    $changed = $true
  }
}

if ($changed) {
  Set-Content -Path $ini -Value $iniContent -Encoding ASCII
  Write-Output "Updated $ini to enable: $($extensions -join ', ')"
} else {
  Write-Output "No changes needed; extensions already enabled."
}

# Show enabled modules to verify
& $phpExe -m | Select-String -Pattern 'pdo_sqlite|sqlite3' | ForEach-Object { $_.Line }