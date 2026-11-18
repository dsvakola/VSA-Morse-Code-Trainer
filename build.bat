@echo off
setlocal EnableExtensions
title VSA Morse Code Trainer - Build
cd /d "%~dp0"

echo ============================================================
echo  VSA Morse Code Trainer - Release build
echo ============================================================
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm was not found. Install it with:  corepack enable
  goto :fail
)

echo [1/4] Installing dependencies with pnpm...
call pnpm install
if errorlevel 1 goto :fail

echo.
echo [2/4] Building the Windows app and installer...
call pnpm tauri build
if errorlevel 1 goto :fail

echo.
echo [3/4] Copying the portable EXE and the installer into the Release folder...
if not exist "Release" mkdir "Release"
copy /y "src-tauri\target\release\vsa-morse-code-trainer.exe" "Release\VSA Morse Code Trainer.exe" >nul
if errorlevel 1 goto :fail
copy /y "src-tauri\target\release\bundle\nsis\*.exe" "Release\" >nul
if errorlevel 1 goto :fail

echo.
echo [4/4] Making the Microsoft Store package (MSIX)...
call :msix
if errorlevel 1 goto :fail

echo.
echo Build finished. Files in the Release folder:
dir /b "Release"
echo.
pause
exit /b 0

:msix
rem Finds MakeAppx and MakePri in the newest Windows 10/11 SDK.
set "SDKBIN="
set "KITS=%ProgramFiles(x86)%\Windows Kits\10\bin"
for /f "delims=" %%D in ('dir /b /ad /o-n "%KITS%\10.*" 2^>nul') do (
  if not defined SDKBIN if exist "%KITS%\%%D\x64\makeappx.exe" set "SDKBIN=%KITS%\%%D\x64"
)
if not defined SDKBIN (
  echo The Windows SDK was not found, so the MSIX package was skipped.
  echo Install "Windows SDK" from Visual Studio Installer to make the Store package.
  exit /b 0
)
for /f "delims=" %%V in ('powershell -NoProfile -Command "(Get-Content 'src-tauri\tauri.conf.json' -Raw | ConvertFrom-Json).version"') do set "APPVER=%%V"
set "PKGVER=%APPVER%.0"
set "STAGE=src-tauri\target\msix-stage"
if exist "%STAGE%" rmdir /s /q "%STAGE%"
mkdir "%STAGE%\Assets"
copy /y "src-tauri\target\release\vsa-morse-code-trainer.exe" "%STAGE%\VSA Morse Code Trainer.exe" >nul || exit /b 1
copy /y "packaging\msix\Assets\*.png" "%STAGE%\Assets\" >nul || exit /b 1
copy /y "LICENSE" "%STAGE%\LICENSE.txt" >nul
powershell -NoProfile -Command "(Get-Content 'packaging\msix\AppxManifest.template.xml' -Raw).Replace('__VERSION__','%PKGVER%') | Set-Content -Encoding UTF8 '%STAGE%\AppxManifest.xml'" || exit /b 1
"%SDKBIN%\makepri.exe" createconfig /cf "src-tauri\target\msix-priconfig.xml" /dq en-US /o >nul || exit /b 1
"%SDKBIN%\makepri.exe" new /pr "%STAGE%" /cf "src-tauri\target\msix-priconfig.xml" /of "%STAGE%\resources.pri" /o >nul || exit /b 1
"%SDKBIN%\makeappx.exe" pack /d "%STAGE%" /p "Release\VSA Morse Code Trainer_%APPVER%_x64.msix" /o || exit /b 1
echo MSIX package made: Release\VSA Morse Code Trainer_%APPVER%_x64.msix (Microsoft signs it when you upload it to Partner Center).
exit /b 0

:fail
echo.
echo BUILD FAILED. Please read the messages above.
pause
exit /b 1
