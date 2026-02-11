#!/bin/bash

# Script rápido para build local antes de subir a producción
set -e

echo "Building project locally..."

# Backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Web
echo "Building frontend..."
cd web
npm run build
cd ..

echo "Build completado! Listo para deploy."
