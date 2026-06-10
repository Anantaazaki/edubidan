@echo off
echo ========================================
echo   MENJALANKAN APLIKASI EDUBIDAN
echo ========================================
echo.
echo Aplikasi sedang starting...
echo Tunggu hingga muncul QR code (1-3 menit)
echo.
cd /d "%~dp0"
npm start
pause
