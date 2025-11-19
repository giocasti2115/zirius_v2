#!/bin/bash

# 🧪 ZIRIUS V2 - QA Testing with ngrok (Linux/Mac)
# ================================================

set -e

echo "🧪 ========================================"
echo "   ZIRIUS V2 - AMBIENTE DE PRUEBAS QA"
echo "========================================"
echo ""

# Verificar ngrok
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado"
    echo "👉 Instala ngrok desde: https://ngrok.com/download"
    exit 1
fi

echo "✅ ngrok encontrado"
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker o Docker Compose no están instalados"
    exit 1
fi

echo "✅ Docker encontrado"
echo ""

# Configurar variables de entorno para QA
cat > .env << EOF
# ZIRIUS V2 - Configuración QA
NODE_ENV=qa
HOST=0.0.0.0
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zirius_qa
DB_USER=root
DB_PASSWORD=password
JWT_SECRET=qa_jwt_secret_2024
CORS_ORIGIN=*
DEBUG=true
ENABLE_SWAGGER=true
EOF

echo "📋 Iniciando servicios Docker..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 30

echo ""
echo "🔍 Verificando estado de servicios..."
docker-compose ps

echo ""
echo "🌐 Creando túneles públicos con ngrok..."
echo ""

# Crear túneles en background
echo "📱 Creando túnel para FRONTEND (Puerto 3000)..."
ngrok http 3000 > /dev/null 2>&1 &
FRONTEND_PID=$!

sleep 5

echo "🔧 Creando túnel para BACKEND API (Puerto 5000)..."
ngrok http 5000 > /dev/null 2>&1 &
BACKEND_PID=$!

sleep 5

echo ""
echo "✅ ¡Túneles creados!"
echo ""

# Obtener URLs de ngrok
FRONTEND_URL=$(curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print([t['public_url'] for t in data['tunnels'] if t['config']['addr'].endswith(':3000')][0])" 2>/dev/null || echo "Ver en http://localhost:4040")

BACKEND_URL=$(curl -s http://localhost:4041/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print([t['public_url'] for t in data['tunnels'] if t['config']['addr'].endswith(':5000')][0])" 2>/dev/null || echo "Ver en http://localhost:4041")

echo "📋 URLS PARA EL EQUIPO DE QA:"
echo "============================="
echo ""
echo "🌐 FRONTEND: $FRONTEND_URL"
echo "🔧 BACKEND API: $BACKEND_URL"
echo "📚 DOCUMENTACIÓN: $BACKEND_URL/api-docs"
echo ""
echo "👥 CREDENCIALES DE PRUEBA:"
echo "=========================="
echo "Usuario: admin@memco.com"
echo "Contraseña: admin123"
echo ""
echo "Usuario: tecnico@memco.com"
echo "Contraseña: tecnico123"
echo ""
echo "🔗 Panel ngrok: http://localhost:4040 y http://localhost:4041"
echo ""
echo "🔄 Para parar: Ctrl+C"
echo "📊 Logs: docker-compose logs -f"
echo ""

# Función para cleanup al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    kill $FRONTEND_PID $BACKEND_PID 2>/dev/null || true
    docker-compose down
    echo "✅ Servicios detenidos."
}

trap cleanup EXIT

# Mantener script corriendo
echo "⏳ Manteniendo túneles activos... (Ctrl+C para salir)"
while true; do
    sleep 60
done