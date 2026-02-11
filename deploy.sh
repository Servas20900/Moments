#!/bin/bash

# Script de despliegue para Moments - Producción DigitalOcean
set -e

echo "Iniciando despliegue de Moments en producción..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que existe .env.production
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production no encontrado${NC}"
    echo "Copia .env.production.example y configura las variables"
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
else
    COMPOSE="docker-compose"
fi

echo -e "${YELLOW}Limpiando contenedores antiguos...${NC}"
$COMPOSE -f docker-compose.prod.yml --env-file .env.production down

echo -e "${YELLOW}Construyendo imágenes Docker...${NC}"
$COMPOSE -f docker-compose.prod.yml --env-file .env.production build --no-cache

echo -e "${YELLOW}Ejecutando migraciones de base de datos...${NC}"
$COMPOSE -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy

echo -e "${YELLOW}Ejecutando seed de base de datos (opcional)...${NC}"
read -r -p "¿Deseas ejecutar el seed? (s/n): " SEED
if [ "$SEED" = "s" ]; then
    $COMPOSE -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma db seed
fi

echo -e "${YELLOW}Iniciando servicios...${NC}"
$COMPOSE -f docker-compose.prod.yml --env-file .env.production up -d

echo -e "${GREEN}Despliegue completado exitosamente!${NC}"
echo ""
echo "Estado de los contenedores:"
$COMPOSE -f docker-compose.prod.yml --env-file .env.production ps
echo ""
echo "Servicios disponibles:"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost"
echo "  - API Docs: http://localhost:3000/api/docs"
echo ""
echo "Para ver los logs:"
echo "  $COMPOSE -f docker-compose.prod.yml --env-file .env.production logs -f"
