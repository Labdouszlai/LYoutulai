@echo off
title YTMDesktop
echo Starting YouTube Music Desktop (lightweight mode)...
echo.
:: --no-sandbox removed: causes STATUS_ACCESS_VIOLATION on this machine
"%~dp0electron.exe" "%~dp0resources\app" ^
  --disable-gpu ^
  --disable-software-rasterizer ^
  --disable-features=Vulkan,UseSkiaRenderer ^
  --force-device-scale-factor=1
