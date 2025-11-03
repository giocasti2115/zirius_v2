@echo off
echo ==========================================
echo Ziriuz Backend - Iniciando servidor
echo ==========================================
echo.

echo Verificando configuracion...
if not exist .env (
    echo ❌ Archivo .env no encontrado
    echo Por favor copia .env.example a .env y configuralo
    pause
    exit /b 1
)

echo ✅ Configuracion encontrada
echo.

echo Iniciando servidor de desarrollo...
echo.
echo ==========================================
echo 🚀 Servidor ejecutandose en:
echo    http://localhost:3000
echo.
echo 📡 Health check:
echo    http://localhost:3000/health
echo.
echo 🔐 API de autenticacion:
echo    POST http://localhost:3000/api/v1/auth/login
echo.
echo Presiona Ctrl+C para detener el servidor
echo ==========================================
echo.

npm run dev