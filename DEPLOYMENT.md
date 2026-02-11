# Deploy a Produccion en DigitalOcean

Este documento describe el flujo recomendado para desplegar Moments en un droplet de DigitalOcean con Docker Compose.

## Requisitos
- Un droplet (Ubuntu 22.04 recomendado) con Docker y Docker Compose instalados.
- Una base de datos Postgres (Managed Database de DigitalOcean recomendado).
- Un dominio (opcional) apuntando al droplet.

## 1) Preparar el servidor
1. Conectate por SSH al droplet.
2. Instala Docker y Docker Compose:
   - https://docs.docker.com/engine/install/ubuntu/
3. Clona el repositorio en el servidor.

## 2) Configurar variables de entorno
1. Copia el archivo de ejemplo:
   - `cp .env.production.example .env.production`
2. Edita `.env.production` y completa los valores reales.
   - `DATABASE_URL` debe usar `sslmode=require` si usas DO Managed DB.
   - `FRONTEND_URL` y `VITE_API_URL` deben apuntar a tu dominio.

## 3) Verificacion previa
Ejecuta el script de verificacion:
- `./verify-production.ps1` (Windows)
- `./verify-production.sh` (si se agrega en Linux)

## 4) Deploy
En el droplet (Linux):
- `./deploy.sh`

En Windows:
- `./deploy.ps1`

El script:
- Construye imagenes con `--env-file .env.production`
- Aplica migraciones de Prisma
- Levanta los servicios

## 5) Puertos y firewall
- Frontend: puerto 80
- Backend: puerto 3000

Recomendado:
- Abrir solo 80/443 al publico.
- Si vas a usar dominio y SSL, configura un proxy (Nginx o Caddy) para /api -> backend.

## 6) Logs
- `docker compose -f docker-compose.prod.yml --env-file .env.production logs -f`

## 7) Actualizaciones
Para un nuevo deploy:
- Pull de cambios
- Ejecutar `./deploy.sh` nuevamente
