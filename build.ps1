param(
  [string]$Version = "1.0.0",
  [string]$Arch = "x64,x86"
)

$Root = Split-Path -Parent $PSCommandPath
$Dist = Join-Path $Root "dist"
$Archs = $Arch.Split(",")

if (!(Test-Path $Dist)) { New-Item -ItemType Directory -Path $Dist | Out-Null }

$SourceFiles = @(
  "YTMDesktop.bat",
  "README.md"
)

function Build-Portable {
  param($Arch)
  
  Write-Host "Building portable package for $Arch..." -ForegroundColor Cyan
  $OutDir = Join-Path $Dist "LYoutulai-$Version-win-$Arch"
  if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
  New-Item -ItemType Directory -Path $OutDir | Out-Null
  
  # Copy source files
  foreach ($f in $SourceFiles) {
    $src = Join-Path $Root $f
    if (Test-Path $src) { Copy-Item $src $OutDir }
  }
  
  # Copy resources (source code)
  $resSrc = Join-Path $Root "resources"
  $resDst = Join-Path $OutDir "resources"
  New-Item -ItemType Directory -Path $resDst | Out-Null
  
  Copy-Item -Recurse (Join-Path $resSrc "app") (Join-Path $resDst "app")
  Copy-Item -Recurse (Join-Path $resSrc "renderer") (Join-Path $resDst "renderer")
  
  # Copy icon
  if (Test-Path (Join-Path $resSrc "tray.ico")) {
    Copy-Item (Join-Path $resSrc "tray.ico") $OutDir
  }
  
  if ($Arch -eq "x64") {
    # Use the existing electron.exe (assumed x64)
    if (Test-Path (Join-Path $Root "electron.exe")) {
      Copy-Item (Join-Path $Root "electron.exe") $OutDir
      Copy-Item (Join-Path $Root "ffmpeg.dll") $OutDir
      Copy-Item (Join-Path $Root "libEGL.dll") $OutDir
      Copy-Item (Join-Path $Root "libGLESv2.dll") $OutDir
      Copy-Item (Join-Path $Root "icudtl.dat") $OutDir
      Copy-Item (Join-Path $Root "snapshot_blob.bin") $OutDir
      Copy-Item (Join-Path $Root "v8_context_snapshot.bin") $OutDir
      Copy-Item (Join-Path $Root "chrome_100_percent.pak") $OutDir
      Copy-Item (Join-Path $Root "chrome_200_percent.pak") $OutDir
      Copy-Item (Join-Path $Root "resources.pak") $OutDir
      Copy-Item (Join-Path $Root "version") $OutDir
      Copy-Item -Recurse (Join-Path $Root "locales") $OutDir
      if (Test-Path (Join-Path $Root "en-US.pak")) {
        Copy-Item (Join-Path $Root "en-US.pak") $OutDir
      }
    } else {
      Write-Host "ERROR: electron.exe not found in project root. Cannot build $Arch." -ForegroundColor Red
      return
    }
  } else {
    # x86: download 32-bit Electron
    $url = "https://github.com/electron/electron/releases/download/v40.0.0/electron-v40.0.0-win32-ia32.zip"
    $zip = Join-Path $Dist "electron-v40.0.0-win32-ia32.zip"
    
    if (!(Test-Path $zip)) {
      Write-Host "Downloading Electron v40.0.0 for win32-ia32..." -ForegroundColor Yellow
      try {
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
      } catch {
        Write-Host "Failed to download Electron for x86. Please download manually from:" -ForegroundColor Red
        Write-Host $url -ForegroundColor Yellow
        return
      }
    }
    
    Write-Host "Extracting Electron x86..." -ForegroundColor Cyan
    Expand-Archive -Path $zip -DestinationPath $OutDir -Force
    
    # Remove unnecessary files from the extracted Electron
    Remove-Item -Recurse -Force (Join-Path $OutDir "resources") -ErrorAction SilentlyContinue
    
    # Copy our source resources
    Copy-Item -Recurse (Join-Path $resSrc "app") (Join-Path $OutDir "resources/app")
    Copy-Item -Recurse (Join-Path $resSrc "renderer") (Join-Path $OutDir "resources/renderer")
    
    # Rename the default Electron executable name to match our launcher
    $electronExe = Get-ChildItem -Path $OutDir -Filter "*.exe" | Where-Object { $_.Name -ne "YTMDesktop.bat" } | Select-Object -First 1
    if ($electronExe -and $electronExe.Name -ne "electron.exe") {
      Rename-Item $electronExe.FullName (Join-Path $OutDir "electron.exe") -Force
    }
  }
  
  # Create ZIP
  Write-Host "Packaging LYoutulai-$Version-win-$Arch.zip..." -ForegroundColor Cyan
  $zipFile = Join-Path $Dist "LYoutulai-$Version-win-$Arch.zip"
  if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
  Compress-Archive -Path "$OutDir\*" -DestinationPath $zipFile
  
  Write-Host "Done: $zipFile" -ForegroundColor Green
}

# Build for each architecture
foreach ($a in $Archs) {
  Build-Portable -Arch $a.Trim()
}

Write-Host "`nAll builds complete. Output in: $Dist" -ForegroundColor Green
