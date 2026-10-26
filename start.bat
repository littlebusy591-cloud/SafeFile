@echo off
title SafeFile Server
echo [1/2] Ensuring MongoDB is running...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB is already running.
) else (
    echo Starting MongoDB service...
    start "MongoDB" /B "C:\Users\manis\mongodb\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "C:\Users\manis\mongodb\data\db" --bind_ip 127.0.0.1
    timeout /t 2 /nobreak >nul
)

echo [2/2] Starting SafeFile Web Server...
echo Opening http://localhost:3000
npm start
