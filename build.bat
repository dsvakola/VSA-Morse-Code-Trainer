@echo off
setlocal EnableExtensions
title VSA Morse Code Trainer - Build
cd /d "%~dp0"

echo ============================================================
echo  VSA Morse Code Trainer - Release build
echo  Vidyasagar Academy - https://vsa.edu.in/software/
echo ============================================================
echo.

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm was not found. Install it with:  corepack enable
  goto :fail
)

echo [1/3] Installing dependencies with pnpm...
call pnpm install
if errorlevel 1 goto :fail

echo.
echo [2/3] Building the Windows app and installer...
call pnpm tauri build
if errorlevel 1 goto :fail

echo.
echo [3/3] Copying the portable EXE and the installer into the Release folder...
if not exist "Release" mkdir "Release"
copy /y "src-tauri\target\release\vsa-morse-code-trainer.exe" "Release\VSA Morse Code Trainer.exe" >nul
if errorlevel 1 goto :fail
copy /y "src-tauri\target\release\bundle\nsis\*.exe" "Release\" >nul
if errorlevel 1 goto :fail

echo.
echo Build finished. Files in the Release folder:
dir /b "Release"
echo.
pause
exit /b 0

:fail
echo.
echo BUILD FAILED. Please read the messages above.
pause
exit /b 1
