param(
  [string]$ServerHost = "localhost",
  [int]$Port = 8000
)

$year = Get-Date -Format yyyy
$month = Get-Date -Format MM
$base = "http://${ServerHost}:${Port}/storage/editor/$year/$month"
$urls = @("$base/tinymce-test.jpg", "$base/tinymce-test.png", "$base/tinymce-test.gif")
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -Method Get -UseBasicParsing
    Write-Output "$u -> $($r.StatusCode)"
  } catch {
    Write-Output "$u -> ERROR: $($_.Exception.Message)"
  }
}