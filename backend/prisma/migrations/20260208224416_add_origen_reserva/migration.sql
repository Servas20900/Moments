-- CreateEnum
CREATE TYPE "OrigenReserva" AS ENUM ('WEB', 'ADMIN', 'CORPORATIVO');

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "origenReserva" "OrigenReserva" NOT NULL DEFAULT 'WEB';
