@echo off
echo ================================
echo Grand City Dashboard Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    echo   Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo √ Node.js is installed
node --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo √ Dependencies installed successfully!
) else (
    echo X Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Run the following commands:
echo.
echo   npm run dev      - Start development server
echo   npm run build    - Build for production
echo   npm run preview  - Preview production build
echo.
echo To deploy to Vercel:
echo   npm install -g vercel
echo   vercel
echo.
pause
