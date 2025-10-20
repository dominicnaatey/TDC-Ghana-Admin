$base = "http://localhost:8000/storage/editor/2025/10"
$urls = @("$base/tinymce-test.jpg", "$base/tinymce-test.png", "$base/tinymce-test.gif")
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -Method Get -UseBasicParsing
    Write-Output "$u -> $($r.StatusCode)"
  } catch {
    Write-Output "$u -> ERROR: $($_.Exception.Message)"
  }
}