-- Migración: Mover cantidad de vehiculos_unidades a vehiculos
-- Esta migración consolida la cantidad de unidades directamente en la tabla vehiculos

-- Paso 1: Agregar columna cantidad a vehiculos con valor por defecto
ALTER TABLE "vehiculos" ADD COLUMN "cantidad" INTEGER NOT NULL DEFAULT 1;

-- Paso 2: Copiar datos de vehiculos_unidades a vehiculos si la tabla existe
-- Solo actualizar si hay datos en vehiculos_unidades
UPDATE "vehiculos" v
SET "cantidad" = vu."cantidad"
FROM "vehiculos_unidades" vu
WHERE v."id" = vu."vehiculoId"
  AND EXISTS (SELECT 1 FROM "vehiculos_unidades" LIMIT 1);

-- Paso 3: Eliminar la tabla vehiculos_unidades si existe
DROP TABLE IF EXISTS "vehiculos_unidades";
