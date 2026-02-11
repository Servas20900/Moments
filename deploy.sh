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

# Cargar variables de entorno
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${YELLOW}Limpiando contenedores antiguos...${NC}"
docker-compose -f docker-compose.prod.yml down

echo -e "${YELLOW}Construyendo imágenes Docker...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}Ejecutando migraciones de base de datos...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

echo -e "${YELLOW}Ejecutando seed de base de datos...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db seed

echo -e "${YELLOW}Iniciando servicios...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${GREEN}Despliegue completado exitosamente!${NC}"
echo ""
echo "Estado de los contenedores:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Servicios disponibles:"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost"
echo "  - API Docs: http://localhost:3000/api/docs"
echo ""
echo "Para ver los logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
