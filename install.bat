@echo off
setlocal enabledelayedexpansion

echo === Gemini Chat App Installation ===
echo This script will install all dependencies for the Gemini Chat App.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js v18 or higher.
    echo Visit: https://nodejs.org/en/download/
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v') do (
    set NODE_VERSION=%%a
    set NODE_VERSION=!NODE_VERSION:~1!
)
if !NODE_VERSION! lss 18 (
    echo ERROR: Node.js version !NODE_VERSION! detected. Version 18 or higher is required.
    echo Please upgrade Node.js and try again.
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Python is not installed. Please install Python 3.8 or higher.
    echo Visit: https://www.python.org/downloads/
    exit /b 1
)

REM Check Python version
for /f "tokens=1,2,3 delims=." %%a in ('python --version 2^>^&1') do (
    set PYTHON_MAJOR=%%a
    set PYTHON_MINOR=%%b
    set PYTHON_MAJOR=!PYTHON_MAJOR:~7!
)
if !PYTHON_MAJOR! lss 3 (
    echo ERROR: Python version !PYTHON_MAJOR!.!PYTHON_MINOR! detected. Version 3.8 or higher is required.
    echo Please upgrade Python and try again.
    exit /b 1
)
if !PYTHON_MAJOR! equ 3 (
    if !PYTHON_MINOR! lss 8 (
        echo ERROR: Python version !PYTHON_MAJOR!.!PYTHON_MINOR! detected. Version 3.8 or higher is required.
        echo Please upgrade Python and try again.
        exit /b 1
    )
)

REM Check if package.json exists
if not exist "%~dp0package.json" (
    echo ERROR: package.json not found.
    echo Make sure you're running this script from the root of the repository.
    exit /b 1
)

echo Installing frontend dependencies...
cd "%~dp0"
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install frontend dependencies.
    echo Try running 'npm install' manually to see detailed errors.
    exit /b 1
)
echo Frontend dependencies installed successfully!

echo Setting up backend...
cd "%~dp0backend"
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend directory not found.
    exit /b 1
)

REM Check if requirements.txt exists
if not exist requirements.txt (
    echo ERROR: requirements.txt not found in backend directory.
    echo Make sure the repository is properly cloned.
    exit /b 1
)

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv .venv
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to create virtual environment.
    echo Try running 'python -m venv .venv' manually to see detailed errors.
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call .venv\Scripts\activate
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to activate virtual environment.
    exit /b 1
)

REM Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    echo Try running 'pip install -r requirements.txt' manually to see detailed errors.
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo Creating .env file...
    echo Please enter your Gemini API key (get one at https://ai.google.dev/gemini-api/docs/api-key):
    set /p API_KEY=
    echo GEMINI_API_KEY=!API_KEY!> .env
    echo .env file created successfully!
) else (
    echo .env file already exists. Skipping creation.
)

REM Return to root directory
cd "%~dp0"

REM Create logs directory
if not exist "%~dp0logs" mkdir "%~dp0logs"
echo Created logs directory for backend server output.

echo.
echo === Installation Complete! ===
echo To start the application:
echo 1. Start the backend server: run.bat backend
echo 2. Start the frontend: run.bat frontend
echo 3. Or start both: run.bat
echo 4. Stop all servers: run.bat stop
echo.
echo Enjoy chatting with Gemini!

endlocal 