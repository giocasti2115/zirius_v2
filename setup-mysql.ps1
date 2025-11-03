# Script para configurar MySQL en el proyecto Ziriuz
# Ejecutar como Administrador

Write-Host "🚀 Configurando MySQL para el proyecto Ziriuz..." -ForegroundColor Green

# Verificar si winget está disponible
try {
    winget --version | Out-Null
    Write-Host "✅ Winget encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Winget no encontrado. Instala MySQL manualmente desde https://dev.mysql.com/downloads/installer/" -ForegroundColor Red
    exit 1
}

# Instalar MySQL Server
Write-Host "📦 Instalando MySQL Server..." -ForegroundColor Yellow
try {
    winget install Oracle.MySQL --accept-package-agreements --accept-source-agreements
    Write-Host "✅ MySQL Server instalado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error al instalar MySQL automáticamente" -ForegroundColor Yellow
    Write-Host "📋 Instrucciones manuales:" -ForegroundColor Cyan
    Write-Host "1. Descargar MySQL desde: https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "2. Ejecutar el instalador y seguir las instrucciones" -ForegroundColor White
    Write-Host "3. Configurar usuario root sin contraseña (para desarrollo)" -ForegroundColor White
    Write-Host "4. Asegurarse de que el servicio MySQL esté ejecutándose" -ForegroundColor White
    Read-Host "Presiona Enter después de instalar MySQL manualmente..."
}

# Esperar a que el servicio esté disponible
Write-Host "⏳ Esperando a que MySQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar instalación
$mysqlService = Get-Service -Name "*mysql*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "✅ Servicio MySQL encontrado: $($mysqlService.Name)" -ForegroundColor Green
    
    # Iniciar servicio si no está ejecutándose
    if ($mysqlService.Status -ne "Running") {
        Write-Host "🔄 Iniciando servicio MySQL..." -ForegroundColor Yellow
        Start-Service $mysqlService.Name
    }
} else {
    Write-Host "❌ Servicio MySQL no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar conexión
Write-Host "🔍 Verificando conexión a MySQL..." -ForegroundColor Yellow
try {
    # Intentar conectar con mysql
    $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    if (Test-Path $mysqlPath) {
        Write-Host "✅ MySQL cliente encontrado en: $mysqlPath" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Cliente MySQL no encontrado en ubicación estándar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Error al verificar MySQL" -ForegroundColor Yellow
}

Write-Host "🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Crear la base de datos 'ziriuzco_ziriuz'" -ForegroundColor White
Write-Host "2. Configurar las credenciales en el archivo .env" -ForegroundColor White
Write-Host "3. Reiniciar el servidor backend" -ForegroundColor White

Write-Host "✨ Script completado!" -ForegroundColor Green