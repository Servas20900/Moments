# Script de verificación pre-producción
$ErrorActionPreference = "Stop"

Write-Host "🔍 Verificando preparación para producción..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Verificar archivos necesarios
Write-Host "📁 Verificando archivos..." -ForegroundColor Yellow
$requiredFiles = @(
    ".env.production",
    "docker-compose.prod.yml",
    "backend/Dockerfile",
    "web/Dockerfile",
    "deploy.ps1",
    "DEPLOYMENT.md"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NO ENCONTRADO" -ForegroundColor Red
        $allGood = $false
    }
}
Write-Host ""

# 2. Verificar que .env.production no esté en git
Write-Host "🔒 Verificando seguridad..." -ForegroundColor Yellow
if (Select-String -Path .gitignore -Pattern ".env.production" -Quiet) {
    Write-Host "  ✅ .env.production está en .gitignore" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  .env.production NO está en .gitignore" -ForegroundColor Yellow
}
Write-Host ""

# 3. Verificar variables críticas en .env.production
Write-Host "⚙️  Verificando variables de entorno..." -ForegroundColor Yellow
$envContent = Get-Content .env.production -Raw

$criticalVars = @(
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "FRONTEND_URL"
)

foreach ($var in $criticalVars) {
    if ($envContent -match $var) {
        Write-Host "  ✅ $var configurado" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $var NO configurado" -ForegroundColor Red
        $allGood = $false
    }
}
Write-Host ""

# 4. Verificar Docker
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "  ✅ Docker instalado: $dockerVersion" -ForegroundColor Green
    
    $composeVersion = docker-compose --version
    Write-Host "  ✅ Docker Compose instalado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Docker no está instalado o no está en PATH" -ForegroundColor Red
    $allGood = $false
}
Write-Host ""

# 5. Verificar estructura de directorios
Write-Host "📂 Verificando estructura..." -ForegroundColor Yellow
$dirs = @("backend", "web", "backend/prisma", "backend/src")
foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $dir NO ENCONTRADO" -ForegroundColor Red
        $allGood = $false
    }
}
Write-Host ""

# Resultado final
Write-Host "================================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "SISTEMA LISTO PARA PRODUCCION" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para desplegar, ejecuta:" -ForegroundColor Cyan
    Write-Host "  .\deploy.ps1" -ForegroundColor White
} else {
    Write-Host "HAY PROBLEMAS QUE RESOLVER" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los errores arriba y corrigelos antes de desplegar." -ForegroundColor Yellow
}
Write-Host "================================================" -ForegroundColor Cyan
