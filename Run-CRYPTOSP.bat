@echo off
title CRYPTOSP Full-Stack Platform Launcher
color 0A
echo ===================================================
echo             CRYPTOSP PLATFORM LAUNCHER
echo ===================================================
echo [1/3] Building & Starting Backend API Server (Port 4000)...
start "CRYPTOSP Backend API" /D "%~dp0backend" cmd /k "npm run build && npm start"

echo [2/3] Starting Frontend Wallet UI (Port 3000)...
start "CRYPTOSP Frontend UI" /D "%~dp0frontend" cmd /k "npm run dev"

echo [3/3] Launching Web Browser...
timeout /t 4 /nobreak >nul
start http://localhost:3000

echo ===================================================
echo CRYPTOSP IS RUNNING!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:4000
echo ===================================================
