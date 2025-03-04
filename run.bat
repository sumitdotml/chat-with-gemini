@echo off
setlocal enabledelayedexpansion

REM Function to print a separator line
:print_separator
echo [94m===============================================================================[0m
goto :eof

REM Function to start the backend server
:start_backend
call :print_separator
echo [92m[1mStarting backend server...[0m
call :print_separator
echo.
cd "%~dp0backend"
if %ERRORLEVEL% neq 0 (
    echo [91mERROR: Backend directory not found.[0m
    exit /b 1
)

REM Check if virtual environment exists
if not exist .venv (
    echo [91mERROR: Virtual environment not found. Please run the installation script first.[0m
    exit /b 1
)

REM Activate virtual environment
call .venv\Scripts\activate
if %ERRORLEVEL% neq 0 (
    echo [91mERROR: Failed to activate virtual environment.[0m
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo [91mERROR: .env file not found. Please run the installation script first.[0m
    exit /b 1
)

REM Start the backend server
echo [93mStarting FastAPI server on http://localhost:8000[0m
echo [93mPress Ctrl+C to stop the server[0m
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
goto :eof

REM Function to start the frontend
:start_frontend
call :print_separator
echo [92m[1mStarting frontend...[0m
call :print_separator
echo.
cd "%~dp0"

REM Check if package.json exists
if not exist package.json (
    echo [91mERROR: package.json not found. Are you in the right directory?[0m
    exit /b 1
)

REM Check if node_modules exists or run npm install if it doesn't
if not exist node_modules (
    echo [93mnode_modules not found. Running npm install...[0m
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [91mERROR: Failed to install frontend dependencies.[0m
        exit /b 1
    )
)

REM Start the frontend
echo [93mStarting Next.js on http://localhost:3000[0m
echo [93mPress Ctrl+C to stop the server[0m
npm run dev
goto :eof

REM Function to start both servers
:start_both
call :print_separator
echo [92m[1mStarting Gemini Chat Application...[0m
call :print_separator
echo.

REM Create logs directory if it doesn't exist
if not exist "%~dp0logs" mkdir "%~dp0logs"

REM Start backend in a new window with logs
cd "%~dp0backend"
if %ERRORLEVEL% neq 0 (
    echo [91mERROR: Backend directory not found.[0m
    exit /b 1
)

REM Check if virtual environment exists
if not exist .venv (
    echo [91mERROR: Virtual environment not found. Please run the installation script first.[0m
    exit /b 1
)

echo [93mStarting FastAPI backend server in a new window...[0m
start "Gemini Chat Backend" cmd /c "cd "%~dp0backend" && call .venv\Scripts\activate && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 > "%~dp0logs\backend.log" 2>&1"

REM Give the backend time to start
timeout /t 2 /nobreak > nul

REM Return to root directory and start frontend
cd "%~dp0"

REM Check if package.json exists
if not exist package.json (
    echo [91mERROR: package.json not found. Are you in the right directory?[0m
    exit /b 1
)

REM Check if node_modules exists or run npm install if it doesn't
if not exist node_modules (
    echo [93mnode_modules not found. Running npm install...[0m
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [91mERROR: Failed to install frontend dependencies.[0m
        exit /b 1
    )
)

echo [93mStarting Next.js frontend...[0m
echo.
echo [94mBackend server is running in a separate window.[0m
echo [94mView backend logs at: .\logs\backend.log[0m
echo.

call :print_separator
echo [92m[1m✅ GEMINI CHAT IS NOW RUNNING![0m
call :print_separator
echo.
echo [92m[1m🌐 Open your browser and go to: http://localhost:3000[0m
echo [92m[1m🤖 Start chatting with Gemini![0m
echo.
echo [93m[1m⚠️  To stop the frontend server: Press Ctrl+C[0m
echo [93m[1m📋 To stop all servers, run: run.bat stop[0m
echo.
call :print_separator
echo.

echo Starting Next.js on http://localhost:3000
npm run dev
goto :eof

REM Function to stop all servers
:stop_servers
call :print_separator
echo [93m[1mStopping all servers...[0m
taskkill /FI "WINDOWTITLE eq Gemini Chat Backend*" /F > nul 2>&1
taskkill /FI "IMAGENAME eq node.exe" /FI "WINDOWTITLE eq *npm*" /F > nul 2>&1
echo [92m[1m✅ All servers stopped.[0m
call :print_separator
goto :eof

REM Function to display usage information
:show_usage
call :print_separator
echo [92m[1mGemini Chat Application - Usage Guide[0m
call :print_separator
echo.
echo Usage: %0 [command]
echo.
echo   [92mbackend[0m  - Start only the backend server
echo   [92mfrontend[0m - Start only the frontend
echo   [92mstop[0m     - Stop running servers
echo   [92m(no args)[0m - Start both backend and frontend
echo.
call :print_separator
goto :eof

REM Main script logic
if "%1"=="backend" (
    call :start_backend
) else if "%1"=="frontend" (
    call :start_frontend
) else if "%1"=="stop" (
    call :stop_servers
) else if "%1"=="help" (
    call :show_usage
) else if "%1"=="-h" (
    call :show_usage
) else if "%1"=="--help" (
    call :show_usage
) else if "%1"=="" (
    call :start_both
) else (
    echo [91mERROR: Invalid argument: %1[0m
    call :show_usage
    exit /b 1
)

endlocal 