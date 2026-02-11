# Script de despliegue para Moments - Producción DigitalOcean (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "Iniciando despliegue de Moments en producción..." -ForegroundColor Cyan

# Verificar que existe .env.production
if (-not (Test-Path .env.production)) {
    Write-Host "Error: .env.production no encontrado" -ForegroundColor Red
    Write-Host "Copia .env.production.example y configura las variables"
    exit 1
}

Write-Host "Limpiando contenedores antiguos..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

Write-Host "Construyendo imágenes Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

Write-Host "Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy

Write-Host "Ejecutando seed de base de datos (opcional)..." -ForegroundColor Yellow
$seed = Read-Host "¿Deseas ejecutar el seed? (s/n)"
if ($seed -eq "s") {
    docker-compose -f docker-compose.prod.yml run --rm backend npx prisma db seed
}

Write-Host "Iniciando servicios..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost:3000"
Write-Host "  - Frontend: http://localhost"
Write-Host "  - API Docs: http://localhost:3000/api/docs"
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor Yellow
Write-Host "  docker-compose -f docker-compose.prod.yml logs -f"
