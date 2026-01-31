# Moments - Frontend Web

Aplicación web React para la plataforma de experiencias turísticas premium Moments.

## 🚀 Características

- **React 19** con TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **FullCalendar** para calendario
- **TypeScript generado** desde OpenAPI
- **Docker** listo para producción con nginx

## 📋 Requisitos

- Node.js 20+
- npm o yarn
- Backend API corriendo

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
```

## 🏃 Ejecución

### Desarrollo
```bash
npm run dev
```

Abre `http://localhost:5173`

### Producción
```bash
npm run build
npm run preview
```

### Docker
```bash
# Desde la raíz del proyecto
docker compose -f docker-compose.prod.yml up -d
```

## 🔧 Variables de Entorno

- `VITE_API_URL`: URL del backend API (requerida)

Ejemplo `.env`:
```env
VITE_API_URL=http://localhost:3000
```

## 📚 Generar Tipos desde API

```bash
# Con el backend corriendo en localhost:3000
npm run generate:types
```

Esto actualiza `src/types/api.ts` desde el esquema OpenAPI del backend.

## 🗂️ Estructura

```
src/
├── api/              # Cliente API
├── components/       # Componentes reutilizables
├── contexts/         # Context providers
├── data/             # Tipos de datos
├── hooks/            # Custom hooks
├── pages/            # Páginas/rutas
├── routes/           # Configuración de rutas
├── styles/           # Estilos globales
├── types/            # Tipos TypeScript
└── utils/            # Utilidades
```

## 🧪 Lint

```bash
npm run lint
```

## 🐳 Docker

El frontend usa:
- Build stage con Vite
- Nginx para servir archivos estáticos
- SPA fallback a index.html

## 📝 Licencia

MIT
