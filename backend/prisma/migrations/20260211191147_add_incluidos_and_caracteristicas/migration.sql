-- AlterTable
ALTER TABLE "paquetes" ADD COLUMN     "incluidos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "caracteristicas" TEXT[] DEFAULT ARRAY[]::TEXT[];
