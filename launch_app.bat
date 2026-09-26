@echo off
title Code Hangman App Launcher
cd /d "%~dp0"

echo ====================================================================
echo  Starting Code Hangman...
echo ====================================================================

:: 1. Check for Node.js (Installed & recommended)
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [*] Node.js runtime detected. Launching application server...
    node server.js
    goto :end
)

:: 2. Check for real Python
where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [*] Python launcher detected. Starting Python server...
    py launch_app.py
    goto :end
)

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    python -c "import sys; sys.exit(0)" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [*] Python runtime detected. Starting Python server...
        python launch_app.py
        goto :end
    )
)

:: 3. Direct Browser Launch Fallback (Chrome or Edge)
echo [*] Standalone runtime not found. Opening directly in browser...

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%~dp0index.html"
    goto :end
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%~dp0index.html"
    goto :end
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%~dp0index.html"
    goto :end
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%~dp0index.html"
    goto :end
)

:: 4. Fallback explorer call
explorer.exe "%~dp0index.html"

:end
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] An error occurred while trying to launch the application.
    pause
)
