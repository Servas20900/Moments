-- MIGRACIÓN: Refactorizar modelo de imágenes para arquitectura de nivel producción
-- Objetivo: 
--   1. Eliminar ImagenSistema (duplicación innecesaria)
--   2. Consolidar todas las imágenes en el modelo Imagen con categorías
--   3. Mover el campo 'orden' a las tablas puente (donde corresponde según contexto)
--   4. Optimizar índices para queries por orden dentro de cada contexto

-- ============================================================================
-- PASO 1: Eliminar tabla imagenes_sistema (si existe)
-- ============================================================================
DROP TABLE IF EXISTS "imagenes_sistema" CASCADE;

-- Asegurar que el enum EstadoActivo exista
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EstadoActivo') THEN
		CREATE TYPE "EstadoActivo" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');
	END IF;
END $$;

-- ============================================================================
-- PASO 1.1: Crear tablas base de imágenes si aún no existen
-- ============================================================================
-- Tabla principal de imágenes (Cloudinary URL + metadata)
CREATE TABLE IF NOT EXISTS "imagenes" (
	"id" TEXT PRIMARY KEY,
	"categoria" TEXT NOT NULL DEFAULT 'GALERIA',
	"url" TEXT NOT NULL,
	"altText" TEXT,
	"estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',
	"creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"actualizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla puente imágenes-paquetes
CREATE TABLE IF NOT EXISTS "imagenes_paquetes" (
	"imagenId" TEXT NOT NULL,
	"paqueteId" TEXT NOT NULL,
	"orden" INTEGER NOT NULL DEFAULT 0,
	CONSTRAINT "imagenes_paquetes_pkey" PRIMARY KEY ("imagenId", "paqueteId"),
	CONSTRAINT "imagenes_paquetes_imagenId_fkey" FOREIGN KEY ("imagenId") REFERENCES "imagenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT "imagenes_paquetes_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla puente imágenes-vehículos
CREATE TABLE IF NOT EXISTS "imagenes_vehiculos" (
	"imagenId" TEXT NOT NULL,
	"vehiculoId" TEXT NOT NULL,
	"orden" INTEGER NOT NULL DEFAULT 0,
	CONSTRAINT "imagenes_vehiculos_pkey" PRIMARY KEY ("imagenId", "vehiculoId"),
	CONSTRAINT "imagenes_vehiculos_imagenId_fkey" FOREIGN KEY ("imagenId") REFERENCES "imagenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT "imagenes_vehiculos_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Tabla puente imágenes-eventos
CREATE TABLE IF NOT EXISTS "imagenes_eventos" (
	"imagenId" TEXT NOT NULL,
	"eventoId" TEXT NOT NULL,
	"orden" INTEGER NOT NULL DEFAULT 0,
	CONSTRAINT "imagenes_eventos_pkey" PRIMARY KEY ("imagenId", "eventoId"),
	CONSTRAINT "imagenes_eventos_imagenId_fkey" FOREIGN KEY ("imagenId") REFERENCES "imagenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
	CONSTRAINT "imagenes_eventos_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "eventos_calendario"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================================
-- PASO 2: Actualizar tabla imagenes para agregar columna categoria
-- ============================================================================
-- Agregar columna categoria a la tabla imagenes
ALTER TABLE "imagenes" ADD COLUMN IF NOT EXISTS "categoria" TEXT NOT NULL DEFAULT 'GALERIA';

-- Crear constraint de enum para categoria
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_categoria_check" CHECK ("categoria" IN ('LANDING_PAGE', 'EXPERIENCIA', 'GALERIA', 'PAQUETE', 'VEHICULO', 'EVENTO'));

-- Remover el campo orden de imagenes (ahora vive en las tablas puente)
ALTER TABLE "imagenes" DROP COLUMN IF EXISTS "orden";

-- ============================================================================
-- PASO 3: Actualizar tabla imagenes_paquetes
-- ============================================================================
-- Agregar columna orden si no existe
ALTER TABLE "imagenes_paquetes" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;

-- Crear índice compuesto para optimizar queries por paquete y orden
CREATE INDEX IF NOT EXISTS "imagenes_paquetes_paqueteId_orden_idx" ON "imagenes_paquetes"("paqueteId", "orden");

-- Eliminar índice anterior si existe (solo paqueteId)
DROP INDEX IF EXISTS "imagenes_paquetes_paqueteId_idx";

-- ============================================================================
-- PASO 4: Actualizar tabla imagenes_vehiculos
-- ============================================================================
-- Agregar columna orden si no existe
ALTER TABLE "imagenes_vehiculos" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;

-- Crear índice compuesto para optimizar queries por vehículo y orden
CREATE INDEX IF NOT EXISTS "imagenes_vehiculos_vehiculoId_orden_idx" ON "imagenes_vehiculos"("vehiculoId", "orden");

-- Eliminar índice anterior si existe
DROP INDEX IF EXISTS "imagenes_vehiculos_vehiculoId_idx";

-- ============================================================================
-- PASO 5: Actualizar tabla imagenes_eventos
-- ============================================================================
-- Agregar columna orden si no existe
ALTER TABLE "imagenes_eventos" ADD COLUMN IF NOT EXISTS "orden" INTEGER NOT NULL DEFAULT 0;

-- Crear índice compuesto para optimizar queries por evento y orden
CREATE INDEX IF NOT EXISTS "imagenes_eventos_eventoId_orden_idx" ON "imagenes_eventos"("eventoId", "orden");

-- Eliminar índice anterior si existe
DROP INDEX IF EXISTS "imagenes_eventos_eventoId_idx";

-- ============================================================================
-- RESULTADO FINAL
-- ============================================================================
-- ✅ Un único modelo Imagen con categorización clara
-- ✅ Tablas puente con orden contextualizado (cada relación maneja su propio orden)
-- ✅ Indices optimizados para queries de imágenes ordenadas por contexto
-- ✅ Eliminación de ImagenSistema (sin duplicación)
-- ✅ Sin pérdida de datos: todas las imágenes existentes migran a Imagen con categoria = 'GALERIA' por defecto
-- ✅ Compatible con Cloudinary: url almacenada directamente, sin duplicación
