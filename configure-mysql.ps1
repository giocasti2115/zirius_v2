# Script para configurar MySQL manualmente
# Ejecutar como Administrador

Write-Host "🔧 Configurando MySQL para Ziriuz..." -ForegroundColor Green

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqlBin = "$mysqlPath\bin"
$dataDir = "$mysqlPath\data"

# Verificar que MySQL esté instalado
if (!(Test-Path "$mysqlBin\mysqld.exe")) {
    Write-Host "❌ MySQL no encontrado en $mysqlBin" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MySQL encontrado en $mysqlPath" -ForegroundColor Green

# Agregar MySQL al PATH del sistema
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$mysqlBin*") {
    Write-Host "📝 Agregando MySQL al PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$mysqlBin", "Machine")
    $env:Path += ";$mysqlBin"
}

# Inicializar el directorio de datos si no existe
if (!(Test-Path $dataDir)) {
    Write-Host "🔧 Inicializando directorio de datos..." -ForegroundColor Yellow
    & "$mysqlBin\mysqld.exe" --initialize-insecure --basedir="$mysqlPath" --datadir="$dataDir"
}

# Instalar como servicio
Write-Host "⚙️ Instalando servicio MySQL..." -ForegroundColor Yellow
try {
    & "$mysqlBin\mysqld.exe" --install MySQL --defaults-file="$mysqlPath\my.ini"
    Write-Host "✅ Servicio MySQL instalado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error al instalar servicio (puede que ya exista)" -ForegroundColor Yellow
}

# Iniciar servicio
Write-Host "🚀 Iniciando servicio MySQL..." -ForegroundColor Yellow
try {
    Start-Service MySQL
    Write-Host "✅ Servicio MySQL iniciado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al iniciar servicio MySQL" -ForegroundColor Red
    Write-Host "Intenta manualmente: net start MySQL" -ForegroundColor Yellow
}

# Verificar que esté ejecutándose
Start-Sleep -Seconds 3
$service = Get-Service -Name MySQL -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ MySQL está ejecutándose correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL no está ejecutándose" -ForegroundColor Red
}

Write-Host "`n🎯 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Abrir MySQL Workbench" -ForegroundColor White
Write-Host "2. Conectar a localhost:3306 (usuario: root, sin contraseña)" -ForegroundColor White
Write-Host "3. Crear la base de datos 'ziriuzco_ziriuz'" -ForegroundColor White