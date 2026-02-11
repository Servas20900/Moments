/*
  Warnings:

  - You are about to drop the `configuracion_sistema` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MotivoDisponibilidad" AS ENUM ('RESERVADO', 'MANTENIMIENTO', 'BLOQUEADO_ADMIN', 'OTRO');

-- DropTable
DROP TABLE "configuracion_sistema";

-- CreateTable
CREATE TABLE "vehiculos_unidades" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidades_vehiculos" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "motivo" "MotivoDisponibilidad" NOT NULL,
    "detalles" TEXT,
    "creadoPor" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilidades_vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_unidades_vehiculoId_key" ON "vehiculos_unidades"("vehiculoId");

-- CreateIndex
CREATE INDEX "disponibilidades_vehiculos_vehiculoId_fecha_idx" ON "disponibilidades_vehiculos"("vehiculoId", "fecha");

-- AddForeignKey
ALTER TABLE "vehiculos_unidades" ADD CONSTRAINT "vehiculos_unidades_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades_vehiculos" ADD CONSTRAINT "disponibilidades_vehiculos_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
