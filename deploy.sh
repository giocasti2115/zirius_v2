#!/bin/bash

# 🚀 ZIRIUS V2 - Script de Despliegue en Producción
# ================================================
# Este script automatiza el despliegue del sistema ZIRIUS V2 en un servidor VPS

set -e  # Salir si hay error

echo "🚀 Iniciando despliegue de ZIRIUS V2..."

# 🎯 CONFIGURACIÓN
DOMAIN="tudominio.com"
REPO_URL="https://github.com/giocasti2115/zirius_v2.git"
DEPLOY_DIR="/opt/zirius_v2"
BACKUP_DIR="/opt/backups/zirius_v2"

# 🔧 FUNCIONES
log() {
    echo "📝 [$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "❌ ERROR: $1" >&2
    exit 1
}

# 🔍 VERIFICACIONES INICIALES
log "Verificando prerequisitos..."

if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
fi

if ! command -v git &> /dev/null; then
    error "Git no está instalado"
fi

# 🛡️ CREAR USUARIO SISTEMA
log "Configurando usuario del sistema..."
if ! id "zirius" &>/dev/null; then
    sudo useradd -r -s /bin/false -d /opt/zirius_v2 zirius
    log "Usuario 'zirius' creado"
fi

# 📁 PREPARAR DIRECTORIOS
log "Preparando directorios..."
sudo mkdir -p $DEPLOY_DIR
sudo mkdir -p $BACKUP_DIR
sudo mkdir -p /opt/zirius_v2/logs
sudo mkdir -p /opt/zirius_v2/nginx/ssl
sudo chown -R zirius:zirius /opt/zirius_v2

# 📥 CLONAR O ACTUALIZAR REPOSITORIO
log "Obteniendo código fuente..."
if [ -d "$DEPLOY_DIR/.git" ]; then
    log "Actualizando repositorio existente..."
    cd $DEPLOY_DIR
    sudo -u zirius git pull origin master
else
    log "Clonando repositorio..."
    sudo -u zirius git clone $REPO_URL $DEPLOY_DIR
    cd $DEPLOY_DIR
fi

# 🔐 CONFIGURAR VARIABLES DE ENTORNO
log "Configurando variables de entorno..."
if [ ! -f "$DEPLOY_DIR/.env.production" ]; then
    log "Copiando archivo de configuración..."
    sudo -u zirius cp .env.production .env
    
    log "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones:"
    echo "   - Cambia las contraseñas por defecto"
    echo "   - Configura tu dominio: $DOMAIN"
    echo "   - Configura tus credenciales de email/notificaciones"
    
    read -p "¿Has configurado el archivo .env? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Configura el archivo .env antes de continuar"
    fi
fi

# 🔒 CONFIGURAR SSL
log "Configurando certificados SSL..."
SSL_DIR="$DEPLOY_DIR/nginx/ssl"

if [ ! -f "$SSL_DIR/zirius.crt" ]; then
    log "Generando certificados SSL autofirmados (para desarrollo)..."
    
    # Certificado para el frontend
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/zirius.key" \
        -out "$SSL_DIR/zirius.crt" \
        -subj "/C=CO/ST=Bogota/L=Bogota/O=MEMCO/CN=zirius.$DOMAIN"
    
    # Certificado para la API
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$SSL_DIR/api.zirius.key" \
        -out "$SSL_DIR/api.zirius.crt" \
        -subj "/C=CO/ST=Bogota/L=Bogota/O=MEMCO/CN=api.zirius.$DOMAIN"
    
    sudo chown -R zirius:zirius "$SSL_DIR"
    sudo chmod 600 "$SSL_DIR"/*.key
    
    log "⚠️  Para producción, reemplaza estos certificados con certificados SSL válidos"
fi

# 🐳 CONSTRUIR Y LEVANTAR SERVICIOS
log "Construyendo y levantando servicios Docker..."
sudo -u zirius docker-compose -f docker-compose.production.yml down
sudo -u zirius docker-compose -f docker-compose.production.yml build --no-cache
sudo -u zirius docker-compose -f docker-compose.production.yml up -d

# ⏳ ESPERAR SERVICIOS
log "Esperando que los servicios estén listos..."
sleep 30

# 🔍 VERIFICAR ESTADO
log "Verificando estado de los servicios..."
if sudo -u zirius docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    log "✅ Servicios levantados correctamente"
else
    error "Algunos servicios no se levantaron correctamente"
fi

# 🌐 CONFIGURAR FIREWALL
log "Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    log "Puertos 80, 443 y 22 abiertos en firewall"
fi

# 📊 MOSTRAR INFORMACIÓN FINAL
log "🎉 ¡Despliegue completado exitosamente!"
echo ""
echo "📋 INFORMACIÓN DEL DESPLIEGUE:"
echo "================================"
echo "🌐 Frontend: https://zirius.$DOMAIN"
echo "🔧 API: https://api.zirius.$DOMAIN"
echo "📚 Documentación: https://api.zirius.$DOMAIN/api-docs"
echo "📁 Archivos: $DEPLOY_DIR"
echo "📊 Logs: $DEPLOY_DIR/logs"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "==================="
echo "Ver logs: docker-compose -f docker-compose.production.yml logs -f"
echo "Reiniciar: docker-compose -f docker-compose.production.yml restart"
echo "Parar: docker-compose -f docker-compose.production.yml down"
echo "Estado: docker-compose -f docker-compose.production.yml ps"
echo ""
echo "⚠️  RECORDATORIOS:"
echo "=================="
echo "1. Configura tus registros DNS para apuntar a este servidor"
echo "2. Reemplaza los certificados SSL autofirmados por certificados válidos"
echo "3. Cambia todas las contraseñas por defecto en el archivo .env"
echo "4. Configura backups automáticos de la base de datos"
echo ""
log "🚀 ZIRIUS V2 está ahora corriendo en producción!"