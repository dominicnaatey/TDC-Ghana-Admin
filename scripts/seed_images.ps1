$d = Get-Date
$dir = "C:\Users\HP\Desktop\DOM\TDC-Ghana-Admin\storage\app\public\editor\{0}\{1:00}" -f $d.Year, $d.Month
New-Item -ItemType Directory -Force -Path $dir | Out-Null

Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 1,1
$bmp.SetPixel(0,0,[System.Drawing.Color]::Red)

$jpg = Join-Path $dir "tinymce-test.jpg"
$png = Join-Path $dir "tinymce-test.png"
$gif = Join-Path $dir "tinymce-test.gif"

$bmp.Save($jpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($gif, [System.Drawing.Imaging.ImageFormat]::Gif)

$bmp.Dispose()

Write-Output "Created:`n$jpg`n$png`n$gif"