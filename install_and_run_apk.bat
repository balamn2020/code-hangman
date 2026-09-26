@echo off
title Install & Run Code Hangman APK
cd /d "%~dp0"

echo ================================================================
echo  Installing Code Hangman APK onto Android Device/Emulator...
echo ================================================================

set ADB_PATH="C:\Users\balam\AppData\Local\Android\Sdk\platform-tools\adb.exe"

where adb >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set ADB_CMD=adb
) else if exist %ADB_PATH% (
    set ADB_CMD=%ADB_PATH%
) else (
    echo [!] ADB tool not found. Please connect your Android device or start an emulator.
    pause
    exit /b 1
)

echo [*] Checking connected Android devices...
%ADB_CMD% devices

echo [*] Installing code-hangman.apk...
%ADB_CMD% install -r "%~dp0code-hangman.apk"

if %ERRORLEVEL% EQU 0 (
    echo [*] Launching Code Hangman on device...
    %ADB_CMD% shell am start -n com.code.hangman/.MainActivity
    echo [✓] App launched successfully!
) else (
    echo [!] Installation failed. Ensure USB Debugging or an Emulator is active.
)

pause
