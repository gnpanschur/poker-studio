@echo off
title Poker Studio - Sit & Go WebApp
cls
echo ===================================================
echo   ♠♥♦♣ Poker Studio - Sit & Go WebApp
echo ===================================================
echo.

rem Prüfen ob dependencies vorhanden sind
if not exist "node_modules" (
    echo [*] Erstmaliges Setup: Installiere Server-Abhaengigkeiten...
    call npm install
)

rem Prüfen ob Frontend gebündelt wurde
if not exist "client\dist" (
    echo [*] Erstmaliges Setup: Baue React-Frontend...
    call npm run build
)

echo.
echo [*] Starte Poker Server auf http://localhost:3000 ...
echo [*] Browser wird automatisch geoeffnet...
echo.

rem Browser nach 2 Sekunden oeffnen
timeout /t 2 /nobreak >nul
start http://localhost:3000

rem Express / Socket.io Server starten
npm start

pause
