# Moments - Backend API

API REST para la plataforma de experiencias turísticas premium Moments.

## 🚀 Características

- **Autenticación JWT** con roles (Admin/Cliente)
- **Rate Limiting** para protección contra ataques
- **Validación de variables de entorno** en inicio
- **Health checks** con verificación de base de datos
- **Logging centralizado** con Winston
- **Headers de seguridad** con Helmet
- **Compresión** de respuestas HTTP
- **Documentación OpenAPI/Swagger** en `/api/docs`
- **Docker** listo para producción

## 📋 Requisitos

- Node.js 20+
- PostgreSQL 14+
- npm o yarn

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar Prisma Client
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Poblar base de datos (opcional)
npm run db:seed
```

## 🏃 Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

### Docker
```bash
# Desde la raíz del proyecto
docker compose -f docker-compose.prod.yml up -d
```

## 🧪 Tests

```bash
# Tests unitarios
npm test

# Tests e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📚 Documentación API

Una vez iniciado el servidor, accede a:
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

## 🔐 Seguridad

- ✅ JWT con secrets obligatorios (validados en inicio)
- ✅ Rate limiting: 100 req/min (10 req/min en auth)
- ✅ Helmet para headers de seguridad
- ✅ CORS restringido a FRONTEND_URL
- ✅ Validación de uploads (tipo y tamaño)
- ✅ Validación de DTOs con class-validator

## 🗂️ Estructura

```
src/
├── common/
│   ├── health/          # Health checks
│   ├── logger/          # Winston logging
│   └── prisma/          # Database service
├── config/
│   └── env.validation.ts # Env validation schema
├── modules/
│   ├── auth/            # Autenticación
│   ├── users/           # Gestión de usuarios
│   ├── packages/        # Paquetes turísticos
│   ├── vehicles/        # Vehículos
│   ├── reservations/    # Reservas
│   └── ...
├── app.module.ts
└── main.ts
```

## 🔧 Variables de Entorno

Consulta `.env.example` para la lista completa. Variables críticas:

- `DATABASE_URL`: Conexión a PostgreSQL
- `JWT_SECRET`: Secret para tokens (obligatorio)
- `FRONTEND_URL`: Origen permitido para CORS
- `CLOUDINARY_*`: Credenciales para uploads

## 📦 Scripts Útiles

```bash
# Prisma Studio (explorar DB)
npm run db:studio

# Generar tipos de OpenAPI
npm run openapi:export

# Lint
npm run lint

# Format
npm run format
```

## 🐳 Docker

El backend incluye:
- `Dockerfile` multi-stage optimizado
- Generación de Prisma Client en build
- Runtime con Node 20 Alpine

## 📝 Licencia

MIT
