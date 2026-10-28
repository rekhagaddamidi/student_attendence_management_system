@echo off
setlocal
cd /d "%~dp0backend"
title Student Attendance Management System

echo ================================================
echo  Student Attendance Management System
echo ================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js LTS from https://nodejs.org/
  echo Then close this window, reopen it, and run START-APP.bat again.
  pause
  exit /b 1
)

if not exist package.json (
  echo Could not find backend\package.json.
  echo Please run this file from the extracted project folder.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing required packages. This may take a few minutes...
  call npm install
  if errorlevel 1 (
    echo Package installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

if not exist .env (
  copy .env.example .env >nul
)

findstr /C:"YOUR_PROJECT_ID" .env >nul
if not errorlevel 1 goto configure
findstr /C:"PASTE_YOUR_SERVER_SIDE_SECRET_KEY_HERE" .env >nul
if not errorlevel 1 goto configure

echo Checking backend JavaScript files...
call npm run check
if errorlevel 1 (
  echo A JavaScript syntax check failed. Please send this error to ChatGPT.
  pause
  exit /b 1
)
echo.
echo Starting the app. Keep this window open while using it.
echo Open http://localhost:3000 in Chrome.
echo Press Ctrl+C to stop the server.
echo.
call npm start
pause
exit /b 0

:configure
echo Supabase setup is still needed before data can be saved.
echo Notepad will open backend\.env. Replace both placeholder values with your own Supabase project values.
echo Do not share the server-side secret key with anyone.
start /wait notepad .env
echo.
echo If you saved your real Supabase values, double-click START-APP.bat again.
pause
exit /b 0
