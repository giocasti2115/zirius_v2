@echo off
REM Script para ejecutar Zirius con Docker en Windows

echo 🐳 Iniciando Zirius con Docker...

REM Detener y limpiar contenedores existentes
echo 🧹 Limpiando contenedores existentes...
docker-compose down

REM Construir y ejecutar los servicios
echo 🔨 Construyendo contenedores...
docker-compose up --build -d

REM Mostrar información
echo.
echo 📋 Servicios iniciados correctamente!
echo 🌐 Frontend estará disponible en: http://localhost:3000
echo 🔧 Backend estará disponible en: http://localhost:3002
echo 📚 Swagger docs en: http://localhost:3002/api-docs
echo 🗄️  MySQL estará disponible en: localhost:3306
echo.
echo 👥 Credenciales de prueba:
echo   admin / admin123
echo   tecnico1 / tecnico123
echo.
echo 📊 Para ver logs en tiempo real:
echo   docker-compose logs -f
echo.
echo 🛑 Para detener todos los servicios:
echo   docker-compose down
echo.

REM Preguntar si quiere ver logs
set /p logs="¿Quieres ver los logs en tiempo real? (y/n): "
if /i "%logs%"=="y" (
    docker-compose logs -f
)

pause