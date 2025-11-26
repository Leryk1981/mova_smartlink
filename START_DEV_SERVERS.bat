@echo off
echo ===================================
echo Starting MOVA Smartlink Dev Servers
echo ===================================
echo.

echo Stopping any running Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo.
echo Starting Worker (Port 8787)...
start "Worker Dev Server" cmd /k "cd /d %~dp0packages\worker-smartlink && npm run dev"

echo Waiting for Worker to start...
timeout /t 8 /nobreak >nul

echo.
echo Starting SPA (Port 3000)...
start "SPA Dev Server" cmd /k "cd /d %~dp0packages\spa-admin && npm run dev"

echo.
echo ===================================
echo Dev servers are starting...
echo ===================================
echo.
echo Worker will be on: http://localhost:8787
echo SPA will be on:    http://localhost:3000
echo.
echo Wait 10 seconds, then open http://localhost:3000 in your browser
echo.
echo Press any key to open browser automatically...
pause >nul

timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo If the interface doesn't work:
echo 1. Open browser Console (F12)
echo 2. Check for errors in red
echo 3. Try Ctrl+Shift+R to hard refresh
echo.

