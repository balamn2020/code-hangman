@echo off
title Open Code Hangman
cd /d "%~dp0"

:: Check Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%~dp0index.html"
    exit /b 0
)

:: Check Edge
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%~dp0index.html"
    exit /b 0
)

:: Fallback default browser via file
start "" "%~dp0index.html"
