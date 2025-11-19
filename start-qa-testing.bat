@echo off
title ZIRIUS V2 - QA Testing Environment
color 0A

echo.
echo 🧪 ========================================
echo    ZIRIUS V2 - AMBIENTE DE PRUEBAS QA
echo ========================================
echo.

echo � Verificando configuración de ngrok...
ngrok version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ngrok no está instalado o configurado
    echo 👉 Ejecuta primero: setup-ngrok-qa.bat
    pause
    exit /b 1
)

echo ✅ ngrok configurado correctamente
echo.
echo �📋 Iniciando servicios Docker...
docker-compose up -d

echo.
echo ⏳ Esperando que los servicios estén listos...
timeout /t 30 /nobreak >nul

echo.
echo 🔍 Verificando estado de servicios...
docker-compose ps

echo.
echo 🌐 Creando túneles públicos con ngrok...
echo.

echo 📱 Abriendo túnel para FRONTEND (Puerto 3000)...
start cmd /k "echo FRONTEND - ZIRIUS V2 QA && ngrok http 3000"

timeout /t 3 /nobreak >nul

echo 🔧 Abriendo túnel para BACKEND API (Puerto 5000)...
start cmd /k "echo BACKEND API - ZIRIUS V2 QA && ngrok http 5000"

echo.
echo ✅ ¡Túneles creados!
echo.
echo 📋 INSTRUCCIONES PARA QA:
echo =========================
echo.
echo 1. 🌐 FRONTEND URL: Copia la URL https://xxxxx.ngrok.io del primer túnel
echo 2. 🔧 BACKEND URL: Copia la URL https://xxxxx.ngrok.io del segundo túnel
echo 3. 📚 DOCUMENTACIÓN: [BACKEND_URL]/api-docs
echo.
echo 👥 CREDENCIALES DE PRUEBA:
echo ==========================
echo Usuario: admin@memco.com
echo Contraseña: admin123
echo.
echo Usuario: tecnico@memco.com  
echo Contraseña: tecnico123
echo.
echo 🔄 Para parar los servicios: Ctrl+C en esta ventana
echo 📊 Logs en tiempo real: docker-compose logs -f
echo.

pause

echo.
echo 🛑 Deteniendo servicios...
docker-compose down

echo.
echo ✅ Servicios detenidos. ¡Gracias por usar ZIRIUS V2!
pause