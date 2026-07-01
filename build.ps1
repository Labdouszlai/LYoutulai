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

function Build-Launcher {
  Write-Host "Compiling LYoutulai.exe..." -ForegroundColor Cyan
  $code = @'
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Text;

class Launcher {
    static void Main(string[] args) {
        string appDir = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
        string runtimeDir = Path.Combine(appDir, "runtime");
        string electronExe = Path.Combine(runtimeDir, "electron.exe");
        string appPath = Path.Combine(appDir, "resources", "app");

        StringBuilder electronArgs = new StringBuilder();
        electronArgs.Append("\"").Append(appPath).Append("\"");

        // Default GPU flags for lightweight mode
        electronArgs.Append(" --disable-gpu --disable-software-rasterizer");
        electronArgs.Append(" --disable-features=Vulkan,UseSkiaRenderer");
        electronArgs.Append(" --force-device-scale-factor=1");

        foreach (string a in args) {
            electronArgs.Append(" \"").Append(a.Replace("\"", "\\\"")).Append("\"");
        }

        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = electronExe;
        psi.Arguments = electronArgs.ToString();
        psi.WorkingDirectory = runtimeDir;
        psi.UseShellExecute = false;

        using (Process p = Process.Start(psi)) {
            p.WaitForExit();
        }
    }
}
'@
  $launcherOut = Join-Path $Root "LYoutulai.exe"
  $null = Add-Type -TypeDefinition $code -OutputAssembly $launcherOut -OutputType WindowsApplication -ErrorAction Stop
  & (Join-Path $Root "rcedit.exe") $launcherOut --set-icon (Join-Path $Root "resources\app\icon.ico") 2>&1 | Out-Null
  if (Test-Path $launcherOut) {
    Write-Host "  LYoutulai.exe compiled with icon" -ForegroundColor Green
  }
}

function Build-Portable {
  param($Arch)
  
  Write-Host "Building portable package for $Arch..." -ForegroundColor Cyan
  $OutDir = Join-Path $Dist "LYoutulai-$Version-win-$Arch"
  if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
  New-Item -ItemType Directory -Path $OutDir | Out-Null
  
  $rtDir = Join-Path $OutDir "runtime"
  New-Item -ItemType Directory -Path $rtDir | Out-Null
  
  # Copy source files
  foreach ($f in $SourceFiles) {
    $src = Join-Path $Root $f
    if (Test-Path $src) { Copy-Item $src $OutDir }
  }
  
  # Copy launcher
  if (Test-Path (Join-Path $Root "LYoutulai.exe")) {
    Copy-Item (Join-Path $Root "LYoutulai.exe") $OutDir
  }
  
  # Copy resources (source code)
  $resSrc = Join-Path $Root "resources"
  $resDst = Join-Path $OutDir "resources"
  New-Item -ItemType Directory -Path $resDst | Out-Null
  Copy-Item -Recurse (Join-Path $resSrc "app") (Join-Path $resDst "app")
  Copy-Item -Recurse (Join-Path $resSrc "renderer") (Join-Path $resDst "renderer")
  
  if ($Arch -eq "x64") {
    # Copy the existing runtime folder (assumed x64)
    $srcRuntime = Join-Path $Root "runtime"
    if (Test-Path $srcRuntime) {
      Copy-Item -Recurse "$srcRuntime\*" $rtDir
    } else {
      Write-Host "ERROR: runtime folder not found. Run the project setup first." -ForegroundColor Red
      return
    }
  } else {
    # x86: download 32-bit Electron
    $url = "https://github.com/electron/electron/releases/download/v40.4.0/electron-v40.4.0-win32-ia32.zip"
    $zip = Join-Path $Dist "electron-v40.4.0-win32-ia32.zip"
    
    if (!(Test-Path $zip)) {
      Write-Host "Downloading Electron v40.4.0 for win32-ia32..." -ForegroundColor Yellow
      $wc = New-Object System.Net.WebClient
      try {
        $wc.DownloadFile($url, $zip)
      } catch {
        Write-Host "Failed to download Electron for x86." -ForegroundColor Red
        Write-Host "Try: Start-BitsTransfer -Source '$url' -Destination '$zip'" -ForegroundColor Yellow
        return
      }
    }
    
    Write-Host "Extracting Electron x86..." -ForegroundColor Cyan
    $tempExtract = Join-Path $Dist "electron-x86-temp"
    if (Test-Path $tempExtract) { Remove-Item -Recurse -Force $tempExtract }
    Expand-Archive -Path $zip -DestinationPath $tempExtract -Force
    
    # Move everything to runtime folder
    Get-ChildItem $tempExtract | Move-Item -Destination $rtDir -Force 2>&1 | Out-Null
    Remove-Item -Recurse -Force $tempExtract
  }
  
  # Ensure tray.ico is in runtime/resources/ for Electron
  $trayDest = Join-Path $rtDir "resources"
  if (!(Test-Path $trayDest)) { New-Item -ItemType Directory -Path $trayDest | Out-Null }
  if (Test-Path (Join-Path $Root "resources\tray.ico")) {
    Copy-Item (Join-Path $Root "resources\tray.ico") (Join-Path $trayDest "tray.ico") -Force
  }
  
  # Create ZIP
  Write-Host "Packaging LYoutulai-$Version-win-$Arch.zip..." -ForegroundColor Cyan
  $zipFile = Join-Path $Dist "LYoutulai-$Version-win-$Arch.zip"
  if (Test-Path $zipFile) { Remove-Item $zipFile -Force }
  Compress-Archive -Path "$OutDir\*" -DestinationPath $zipFile
  
  Write-Host "Done: $zipFile" -ForegroundColor Green
}

# Build launcher first (used by all architectures)
Build-Launcher

# Build for each architecture
foreach ($a in $Archs) {
  Build-Portable -Arch $a.Trim()
}

Write-Host "`nAll builds complete. Output in: $Dist" -ForegroundColor Green
