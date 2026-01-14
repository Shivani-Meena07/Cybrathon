@echo off
REM Smart Queue System - Deployment & Testing Checklist (Windows)
REM Run this to verify everything is working

echo.
echo Checking Smart Queue System Installation...
echo.

REM Check Node.js
echo [1/3] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install Node.js
    exit /b 1
)

echo.
echo [2/3] Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    exit /b 1
)

echo.
echo [3/3] Checking directory structure...

REM Check backend files
echo.
echo Backend files:
if exist "backend\server.js" (
    echo   [OK] server.js exists
) else (
    echo   [FAIL] server.js missing
)

if exist "backend\.env" (
    echo   [OK] .env exists
) else (
    echo   [FAIL] .env missing
)

if exist "backend\package.json" (
    echo   [OK] package.json exists
) else (
    echo   [FAIL] package.json missing
)

REM Check frontend files
echo.
echo Frontend files:
if exist "frontend\src\App.jsx" (
    echo   [OK] App.jsx exists
) else (
    echo   [FAIL] App.jsx missing
)

if exist "frontend\src\main.jsx" (
    echo   [OK] main.jsx exists
) else (
    echo   [FAIL] main.jsx missing
)

if exist "frontend\src\index.css" (
    echo   [OK] index.css exists
) else (
    echo   [FAIL] index.css missing
)

REM Check pages
echo.
echo Page files:
if exist "frontend\src\pages\StudentDashboard.jsx" (
    echo   [OK] StudentDashboard.jsx exists
) else (
    echo   [FAIL] StudentDashboard.jsx missing
)

if exist "frontend\src\pages\AdminDashboard.jsx" (
    echo   [OK] AdminDashboard.jsx exists
) else (
    echo   [FAIL] AdminDashboard.jsx missing
)

REM Check components
echo.
echo Component files:
if exist "frontend\src\components\TokenCard.js" (
    echo   [OK] TokenCard.js exists
) else (
    echo   [FAIL] TokenCard.js missing
)

if exist "frontend\src\components\ServiceCard.js" (
    echo   [OK] ServiceCard.js exists
) else (
    echo   [FAIL] ServiceCard.js missing
)

REM Check documentation
echo.
echo Documentation files:
if exist "README.md" (
    echo   [OK] README.md exists
) else (
    echo   [FAIL] README.md missing
)

if exist "QUICK_START.md" (
    echo   [OK] QUICK_START.md exists
) else (
    echo   [FAIL] QUICK_START.md missing
)

echo.
echo ========================================
echo [SUCCESS] All files are present!
echo ========================================
echo.
echo Next steps to run the system:
echo.
echo 1. Open Command Prompt / PowerShell
echo.
echo    Terminal 1 (Backend):
echo    cd backend
echo    npm install
echo    npm start
echo.
echo    Terminal 2 (Frontend):
echo    cd frontend
echo    npm install
echo    npm run dev
echo.
echo 2. Open browser:
echo    http://localhost:5173
echo.
echo 3. System is ready for demo!
echo.
pause
