# Script de despliegue para Moments - Producción DigitalOcean (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "Iniciando despliegue de Moments en producción..." -ForegroundColor Cyan

# Verificar que existe .env.production
if (-not (Test-Path .env.production)) {
    Write-Host "Error: .env.production no encontrado" -ForegroundColor Red
    Write-Host "Copia .env.production.example y configura las variables"
    exit 1
}

try {
    docker compose version | Out-Null
    $composeCmd = @("docker", "compose")
} catch {
    $composeCmd = @("docker-compose")
}

$composeDisplay = $composeCmd -join " "

Write-Host "Limpiando contenedores antiguos..." -ForegroundColor Yellow
& $composeCmd -f docker-compose.prod.yml --env-file .env.production down

Write-Host "Construyendo imágenes Docker..." -ForegroundColor Yellow
& $composeCmd -f docker-compose.prod.yml --env-file .env.production build --no-cache

Write-Host "Ejecutando migraciones de base de datos..." -ForegroundColor Yellow
& $composeCmd -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma migrate deploy

Write-Host "Ejecutando seed de base de datos (opcional)..." -ForegroundColor Yellow
$seed = Read-Host "¿Deseas ejecutar el seed? (s/n)"
if ($seed -eq "s") {
    & $composeCmd -f docker-compose.prod.yml --env-file .env.production run --rm backend npx prisma db seed
}

Write-Host "Iniciando servicios..." -ForegroundColor Yellow
& $composeCmd -f docker-compose.prod.yml --env-file .env.production up -d

Write-Host "Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Estado de los contenedores:" -ForegroundColor Cyan
& $composeCmd -f docker-compose.prod.yml --env-file .env.production ps
Write-Host ""
Write-Host "Servicios disponibles:" -ForegroundColor Cyan
Write-Host "  - Backend: http://localhost:3000"
Write-Host "  - Frontend: http://localhost"
Write-Host "  - API Docs: http://localhost:3000/api/docs"
Write-Host ""
Write-Host "Para ver los logs:" -ForegroundColor Yellow
Write-Host "  $composeDisplay -f docker-compose.prod.yml --env-file .env.production logs -f"
