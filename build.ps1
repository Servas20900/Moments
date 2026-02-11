# Script rápido para build local antes de subir a producción
$ErrorActionPreference = "Stop"

Write-Host "Building project locally..." -ForegroundColor Cyan

# Backend
Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
npm run build
Set-Location ..

# Web
Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location web
npm run build
Set-Location ..

Write-Host "Build completado! Listo para deploy." -ForegroundColor Green
