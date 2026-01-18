/*
  Warnings:

  - You are about to drop the column `estaActivo` on the `cantones` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `carritos` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `categorias_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `conductores` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `distritos` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `eventos_calendario` table. All the data in the column will be lost.
  - You are about to drop the column `imagenUrl` on the `eventos_calendario` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `historial_estados_reserva` table. All the data in the column will be lost.
  - The primary key for the `imagenes_paquetes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `altText` on the `imagenes_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `creadoEn` on the `imagenes_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `imagenes_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `imagenes_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `imagenes_paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `items_carrito` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `metodos_pago` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `notificaciones` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `ocupacion_vehiculos` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `pagos_reservas` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `imagenUrl` on the `paquetes` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `provincias` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `reservas` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `usuarios` table. All the data in the column will be lost.
  - The `estado` column on the `usuarios` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `estaActivo` on the `usuarios_roles` table. All the data in the column will be lost.
  - You are about to drop the column `estaActivo` on the `vehiculos` table. All the data in the column will be lost.
  - You are about to drop the column `imagenUrl` on the `vehiculos` table. All the data in the column will be lost.
  - Changed the type of `categoria` on the `imagenes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `imagenId` to the `imagenes_paquetes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CategoriaImagen" ADD VALUE 'PAQUETE';
ALTER TYPE "CategoriaImagen" ADD VALUE 'VEHICULO';
ALTER TYPE "CategoriaImagen" ADD VALUE 'EVENTO';

-- AlterTable
ALTER TABLE "cantones" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "carritos" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "categorias_paquetes" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "conductores" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "distritos" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "eventos_calendario" DROP COLUMN "estaActivo",
DROP COLUMN "imagenUrl";

-- AlterTable
ALTER TABLE "historial_estados_reserva" DROP COLUMN "estaActivo",
ADD COLUMN     "activo" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "imagenes" DROP COLUMN "categoria",
ADD COLUMN     "categoria" "CategoriaImagen" NOT NULL,
ALTER COLUMN "actualizadoEn" DROP DEFAULT;

-- AlterTable
ALTER TABLE "imagenes_paquetes" DROP CONSTRAINT "imagenes_paquetes_pkey",
DROP COLUMN "altText",
DROP COLUMN "creadoEn",
DROP COLUMN "estaActivo",
DROP COLUMN "id",
DROP COLUMN "url",
ADD COLUMN     "imagenId" TEXT NOT NULL,
ADD CONSTRAINT "imagenes_paquetes_pkey" PRIMARY KEY ("imagenId", "paqueteId");

-- AlterTable
ALTER TABLE "items_carrito" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "metodos_pago" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "notificaciones" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "ocupacion_vehiculos" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "pagos_reservas" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "paquetes" DROP COLUMN "estaActivo",
DROP COLUMN "imagenUrl",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "provincias" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "reservas" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "estaActivo",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "estaActivo",
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- AlterTable
ALTER TABLE "usuarios_roles" DROP COLUMN "estaActivo";

-- AlterTable
ALTER TABLE "vehiculos" DROP COLUMN "estaActivo",
DROP COLUMN "imagenUrl",
ADD COLUMN     "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO';

-- DropEnum
DROP TYPE "EstadoUsuario";

-- AddForeignKey
ALTER TABLE "imagenes_paquetes" ADD CONSTRAINT "imagenes_paquetes_imagenId_fkey" FOREIGN KEY ("imagenId") REFERENCES "imagenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
