-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrigenReserva" ADD VALUE 'WHATSAPP';
ALTER TYPE "OrigenReserva" ADD VALUE 'INSTAGRAM';
ALTER TYPE "OrigenReserva" ADD VALUE 'CORREO';
ALTER TYPE "OrigenReserva" ADD VALUE 'MANUAL';

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "notasInternas" TEXT;
