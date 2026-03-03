-- Operative refactor:
-- 1) Remove geography (Provincia/Canton/Distrito + usuario.distritoId)
-- 2) Add CategoriaVehiculo and migrate vehiculos.categoria (string) -> categoriaId
-- 3) Simplify Reserva to day-based occupancy (drop horaInicio/horaFin)
-- 4) Optimize Reserva index for occupancy counting

-- =========================
-- CategoriaVehiculo
-- =========================
CREATE TABLE IF NOT EXISTS "categorias_vehiculos" (
  "id" SERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO'
);

ALTER TABLE "vehiculos" ADD COLUMN IF NOT EXISTS "categoriaId" INTEGER;

INSERT INTO "categorias_vehiculos" ("nombre")
SELECT DISTINCT "categoria"
FROM "vehiculos"
WHERE "categoria" IS NOT NULL
  AND btrim("categoria") <> ''
ON CONFLICT ("nombre") DO NOTHING;

UPDATE "vehiculos" v
SET "categoriaId" = cv."id"
FROM "categorias_vehiculos" cv
WHERE v."categoriaId" IS NULL
  AND cv."nombre" = v."categoria";

INSERT INTO "categorias_vehiculos" ("nombre")
VALUES ('General')
ON CONFLICT ("nombre") DO NOTHING;

UPDATE "vehiculos"
SET "categoriaId" = (SELECT "id" FROM "categorias_vehiculos" WHERE "nombre" = 'General')
WHERE "categoriaId" IS NULL;

ALTER TABLE "vehiculos"
  ALTER COLUMN "categoriaId" SET NOT NULL;

ALTER TABLE "vehiculos"
  ADD CONSTRAINT "vehiculos_categoriaId_fkey"
  FOREIGN KEY ("categoriaId") REFERENCES "categorias_vehiculos"("id")
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE "vehiculos" DROP COLUMN IF EXISTS "categoria";

-- =========================
-- Reserva simplificada
-- =========================
ALTER TABLE "reservas" DROP COLUMN IF EXISTS "horaInicio";
ALTER TABLE "reservas" DROP COLUMN IF EXISTS "horaFin";

DROP INDEX IF EXISTS "reservas_vehiculoId_fechaEvento_idx";
CREATE INDEX IF NOT EXISTS "reservas_vehiculoId_fechaEvento_estado_idx"
  ON "reservas"("vehiculoId", "fechaEvento", "estado");

-- =========================
-- Remove geography
-- =========================
ALTER TABLE "usuarios" DROP CONSTRAINT IF EXISTS "usuarios_distritoId_fkey";
ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "distritoId";

DROP TABLE IF EXISTS "distritos";
DROP TABLE IF EXISTS "cantones";
DROP TABLE IF EXISTS "provincias";
