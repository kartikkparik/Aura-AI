@echo off
chcp 65001 >nul 2>&1
title Aura AI v2.0 - Launcher
color 0A

echo.
echo  ============================================================
echo     AURA AI v2.0 - AI Career Guidance for Every Field
echo     Powered by Groq LLaMA 3.3 70B
echo  ============================================================
echo.
echo  Creator & Developer: Kartik Pareek
echo.

:: Fix Node.js PATH if needed
set PATH=C:\Program Files\nodejs;%PATH%
set PATH=C:\Users\%USERNAME%\AppData\Roaming\npm;%PATH%

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found! Please install Python 3.10+ from python.org
    pause
    exit /b 1
)

:: Install / update Python dependencies (output redirected to avoid CMD parsing issues)
echo  [1/4] Installing Python dependencies...
python -m pip install -r "%~dp0backend\requirements.txt" -q -q >nul 2>&1
echo  [1/4] Python dependencies ready.

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found! Please install from nodejs.org
    pause
    exit /b 1
)

:: Install frontend node_modules if missing
if not exist "%~dp0frontend\node_modules" (
    echo  [2/4] Installing Node.js dependencies [first time]...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
) else (
    echo  [2/4] Node modules already installed. Skipping...
)

:: Pick a free backend port
set "BACKEND_PORT=5000"
:find_backend_port
netstat -ano | findstr ":%BACKEND_PORT% " >nul 2>&1
if not errorlevel 1 (
    set /a BACKEND_PORT+=1
    if %BACKEND_PORT% GTR 5010 goto backend_port_fail
    goto find_backend_port
)

:: Pick a free frontend port
set "FRONTEND_PORT=5173"
:find_frontend_port
netstat -ano | findstr ":%FRONTEND_PORT% " >nul 2>&1
if not errorlevel 1 (
    set /a FRONTEND_PORT+=1
    if %FRONTEND_PORT% GTR 5199 goto frontend_port_fail
    goto find_frontend_port
)

:: Start Backend
echo  [3/4] Starting Flask Backend on port %BACKEND_PORT%...
start "Aura AI - Backend" cmd /k "cd /d %~dp0backend && set PORT=%BACKEND_PORT% && python app.py"

:: Wait for backend to init
timeout /t 3 /nobreak >nul

:: Start Frontend
echo  [4/4] Starting React Frontend on port %FRONTEND_PORT%...
start "Aura AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port %FRONTEND_PORT%"

:: Wait and open browser
timeout /t 5 /nobreak >nul
echo.
echo  Opening http://localhost:%FRONTEND_PORT% in browser...
start http://localhost:%FRONTEND_PORT%

echo.
echo  ============================================================
echo    Both servers are running!
echo    Backend:  http://localhost:%BACKEND_PORT%
echo    Frontend: http://localhost:%FRONTEND_PORT%
echo.
echo    Chat in Hindi, Hinglish, or English - any career field!
echo  ============================================================
echo.
echo  Press any key to close this launcher (servers stay running)...
pause >nul

goto :eof

:backend_port_fail
    echo  [ERROR] No free backend port found between 5000 and 5010.
    pause >nul
    exit /b 1

:frontend_port_fail
    echo  [ERROR] No free frontend port found between 5173 and 5199.
    pause >nul
    exit /b 1
