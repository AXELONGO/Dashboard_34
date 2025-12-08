#!/bin/bash
echo "🟢 Reconstruyendo e iniciando contenedores (SIN CACHÉ)..."
# Intentar usar docker compose (v2) o docker-compose (v1)
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ Error: No se encontró docker compose ni docker-compose."
    exit 1
fi

$DOCKER_COMPOSE_CMD down
$DOCKER_COMPOSE_CMD build --no-cache
$DOCKER_COMPOSE_CMD up -d
echo "✅ Proceso completado. Verifica en: http://localhost:8081"
