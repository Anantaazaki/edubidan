@echo off
echo ========================================
echo   MEMBUKA APLIKASI EDUBIDAN
echo ========================================
echo.
echo Membersihkan port yang digunakan...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
echo.
echo Menjalankan aplikasi di web browser...
echo Tunggu sebentar, browser akan terbuka otomatis...
echo.
cd /d "%~dp0"
start /B npx expo start --web --port 19006
timeout /t 15 /nobreak
start 
echo.
echo ========================================
echo Browser akan terbuka dalam beberapa detik
echo Jika tidak terbuka, buka manual:
echo http://localhost:19006
echo ========================================
echo.
pause
