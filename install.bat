@echo off
echo ==========================================
echo Ziriuz Backend - Instalacion y Prueba
echo ==========================================
echo.

echo Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no esta instalado
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo Descarga la version LTS y reinicia VS Code despues de instalar
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version
echo.

echo Verificando npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no esta disponible
    echo.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version
echo.

echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo.
echo ✅ Dependencias instaladas

echo.
echo Compilando TypeScript...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Error al compilar TypeScript
    pause
    exit /b 1
)

echo.
echo ✅ Compilacion exitosa

echo.
echo Verificando archivo .env...
if not exist .env (
    echo ⚠️  Archivo .env no encontrado, copiando desde .env.example
    copy .env.example .env
)

echo.
echo ==========================================
echo 🎉 ¡Todo listo!
echo ==========================================
echo.
echo Para iniciar el servidor:
echo   npm run dev
echo.
echo Para probar la API:
echo   1. Configura tu base de datos en .env
echo   2. Usa los ejemplos en API_EXAMPLES.md
echo.
echo ==========================================
pause