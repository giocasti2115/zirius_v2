@echo off
echo 🧪 ZIRIUS V2 - Configuracion para QA
echo ===================================

echo.
echo Instalando ngrok...
npm install -g ngrok

echo.
echo ⚠️  IMPORTANTE: Registrate en https://ngrok.com y obtén tu token
echo Luego ejecuta: ngrok authtoken TU_TOKEN_AQUI

echo.
echo 🚀 Para levantar ZIRIUS V2 para QA:
echo 1. Ejecuta: start-qa-testing.bat
echo 2. Comparte las URLs generadas con el equipo de QA

pause