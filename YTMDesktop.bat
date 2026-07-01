@echo off
title L'Youtulai
echo Starting L'Youtulai (lightweight YT Music)...
echo.
:: --no-sandbox removed: causes STATUS_ACCESS_VIOLATION on this machine
"%~dp0runtime\electron.exe" "%~dp0resources\app" ^
  --disable-gpu ^
  --disable-software-rasterizer ^
  --disable-features=Vulkan,UseSkiaRenderer ^
  --force-device-scale-factor=1
