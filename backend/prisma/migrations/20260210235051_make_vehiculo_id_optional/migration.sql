-- DropForeignKey
ALTER TABLE "reservas" DROP CONSTRAINT "reservas_vehiculoId_fkey";

-- AlterTable
ALTER TABLE "reservas" ALTER COLUMN "vehiculoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
