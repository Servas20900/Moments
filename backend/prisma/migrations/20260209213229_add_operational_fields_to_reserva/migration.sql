-- CreateEnum
CREATE TYPE "EstadoContacto" AS ENUM ('PENDIENTE', 'CONTACTADO', 'CONFIRMADO');

-- AlterTable
ALTER TABLE "reservas" ADD COLUMN     "adelantoRecibido" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "choferAsignado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactoCliente" "EstadoContacto" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "eventoRealizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pagoCompleto" BOOLEAN NOT NULL DEFAULT false;
