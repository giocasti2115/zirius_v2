@echo off
title ZIRIUS V2 - QA Environment Setup
color 0B

echo.
echo 🧪 ==========================================
echo    ZIRIUS V2 - CONFIGURACION RAPIDA PARA QA
echo ==========================================
echo.

echo 📋 Paso 1: Registrate en ngrok (si no lo has hecho)
echo    👉 Ve a: https://ngrok.com/signup
echo    👉 Crea una cuenta gratuita
echo    👉 Copia tu token de autenticación
echo.

set /p "token=🔑 Pega tu token de ngrok aqui: "

if "%token%"=="" (
    echo ❌ Token requerido. Obten tu token en https://dashboard.ngrok.com/get-started/your-authtoken
    pause
    exit /b 1
)

echo.
echo 🔐 Configurando token de ngrok...
ngrok authtoken %token%

if %errorlevel% neq 0 (
    echo ❌ Error configurando token. Verifica que sea correcto.
    pause
    exit /b 1
)

echo ✅ Token configurado correctamente!
echo.
echo 📁 Copiando archivos de configuración QA...

echo # ZIRIUS V2 - Configuración QA > .env
echo NODE_ENV=qa >> .env
echo HOST=0.0.0.0 >> .env
echo PORT=5000 >> .env
echo DB_HOST=localhost >> .env
echo DB_PORT=3306 >> .env
echo DB_NAME=zirius_qa >> .env
echo DB_USER=root >> .env
echo DB_PASSWORD=password >> .env
echo JWT_SECRET=qa_jwt_secret_2024 >> .env
echo CORS_ORIGIN=* >> .env
echo DEBUG=true >> .env
echo ENABLE_SWAGGER=true >> .env

echo.
echo ✅ Configuración completada!
echo.
echo 🚀 SIGUIENTE PASO: Ejecuta start-qa-testing.bat
echo    Esto levantará los servicios y creará las URLs públicas
echo.

pause