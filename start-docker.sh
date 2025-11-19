#!/bin/bash

# Script para ejecutar Zirius con Docker
echo "🐳 Iniciando Zirius con Docker..."

# Crear network si no existe
docker network create zirius_network 2>/dev/null || true

# Detener y limpiar contenedores existentes
echo "🧹 Limpiando contenedores existentes..."
docker-compose down

# Construir y ejecutar los servicios
echo "🔨 Construyendo contenedores..."
docker-compose up --build -d

# Mostrar logs
echo "📋 Mostrando logs de los servicios..."
echo "🌐 Frontend estará disponible en: http://localhost:3000"
echo "🔧 Backend estará disponible en: http://localhost:3002"
echo "📚 Swagger docs en: http://localhost:3002/api-docs"
echo "🗄️  MySQL estará disponible en: localhost:3306"
echo ""
echo "👥 Credenciales de prueba:"
echo "  admin / admin123"
echo "  tecnico1 / tecnico123"
echo ""
echo "📊 Para ver logs en tiempo real:"
echo "  docker-compose logs -f"
echo ""
echo "🛑 Para detener todos los servicios:"
echo "  docker-compose down"

# Opcional: mostrar logs en tiempo real
read -p "¿Quieres ver los logs en tiempo real? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose logs -f
fi