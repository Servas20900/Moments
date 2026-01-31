# 🔒 Configuración de Seguridad - Guía de Setup

## Variables de Entorno Requeridas

### Backend (.env)

El backend **requiere** las siguientes variables críticas para funcionar:

```bash
# Copia .env.example a .env
cp backend/.env.example backend/.env
```

#### Variables CRÍTICAS (Obligatorias):

1. **NODE_ENV**: Define el entorno de ejecución
   ```
   NODE_ENV=development  # o production
   ```

2. **DATABASE_URL**: Conexión a PostgreSQL
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. **JWT_SECRET**: Clave secreta para tokens (CRÍTICO)
   ```bash
   # Genera una clave segura con:
   openssl rand -base64 32
   
   JWT_SECRET=tu_clave_segura_aquí_mínimo_32_caracteres
   ```

4. **FRONTEND_URL**: URL del frontend para CORS
   ```
   FRONTEND_URL=http://localhost:5173  # development
   FRONTEND_URL=https://tudominio.com   # production
   ```

#### Variables Opcionales (pero recomendadas):

5. **CLOUDINARY** (para gestión de imágenes):
   ```
   CLOUDINARY_CLOUD_NAME=tu_cloud_name
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   ```

6. **ADMIN_DEFAULT_PASSWORD** (para seed):
   ```
   ADMIN_DEFAULT_PASSWORD=ContraseñaSegura123!
   ```

### Docker Compose (.env.docker)

Para ejecutar PostgreSQL con Docker:

```bash
# Copia el ejemplo
cp .env.docker.example .env.docker

# Edita .env.docker con tus valores
```

Variables necesarias:
```
POSTGRES_USER=moments_user
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=moments_db
```

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

```bash
# Backend
cd backend
cp .env.example .env
# Edita .env con tus valores

# Docker (opcional)
cd ..
cp .env.docker.example .env.docker
# Edita .env.docker con tu password de PostgreSQL
```

### 2. Generar Claves Seguras

```bash
# JWT_SECRET
openssl rand -base64 32

# JWT_REFRESH_SECRET  
openssl rand -base64 32

# ADMIN_DEFAULT_PASSWORD (crear una fuerte)
```

### 3. Iniciar Base de Datos

```bash
# Con Docker
docker-compose --env-file .env.docker up -d

# O manualmente con PostgreSQL instalado
```

### 4. Configurar Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

## ⚠️ Seguridad en Producción

### Checklist de Seguridad:

- [ ] ✅ `JWT_SECRET` es una clave aleatoria fuerte (mínimo 32 caracteres)
- [ ] ✅ `NODE_ENV=production` está configurado
- [ ] ✅ `FRONTEND_URL` apunta a tu dominio real (https)
- [ ] ✅ `POSTGRES_PASSWORD` es una contraseña fuerte
- [ ] ✅ `ADMIN_DEFAULT_PASSWORD` cambió del valor por defecto
- [ ] ✅ Todas las credenciales están en `.env` (NO en el código)
- [ ] ✅ `.env` está en `.gitignore` (NUNCA hacer commit)
- [ ] ✅ Cloudinary está configurado si usas imágenes

### Valores que NUNCA debes usar en producción:

❌ `JWT_SECRET=your_jwt_secret_key_here`
❌ `POSTGRES_PASSWORD=password`
❌ `ADMIN_DEFAULT_PASSWORD=Admin123!`
❌ `NODE_ENV=development`

## 🔍 Validación Automática

El backend ahora **valida automáticamente** todas las variables de entorno al iniciar.

Si falta alguna variable crítica, verás un error como:

```
❌ CONFIGURACIÓN INVÁLIDA - Variables de entorno:
  • JWT_SECRET: should not be empty
  • DATABASE_URL: should not be empty

🔧 Verifica tu archivo .env y asegúrate de tener todas las variables requeridas.
📝 Consulta .env.example para ver un ejemplo de configuración.
```

Esto previene que el servidor inicie con configuración insegura.

## 📚 Más Información

- Ver archivo completo: `backend/.env.example`
- Validación de entorno: `backend/src/config/env.validation.ts`
- Auditoría completa: `AUDITORIA_PRODUCCION.md`
