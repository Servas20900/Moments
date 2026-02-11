/*
  Warnings:

  - A unique constraint covering the columns `[numeroFactura]` on the table `reservas` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "numeroFactura" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reservas_numeroFactura_key" ON "reservas"("numeroFactura");

-- CreateIndex
CREATE INDEX "reservas_numeroFactura_idx" ON "reservas"("numeroFactura");
