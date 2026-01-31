/*
  Warnings:

  - You are about to drop the `carritos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `items_carrito` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `metodos_pago` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notificaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ocupacion_vehiculos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "carritos" DROP CONSTRAINT "carritos_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "items_carrito" DROP CONSTRAINT "items_carrito_carritoId_fkey";

-- DropForeignKey
ALTER TABLE "items_carrito" DROP CONSTRAINT "items_carrito_paqueteId_fkey";

-- DropForeignKey
ALTER TABLE "metodos_pago" DROP CONSTRAINT "metodos_pago_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "notificaciones" DROP CONSTRAINT "notificaciones_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "ocupacion_vehiculos" DROP CONSTRAINT "ocupacion_vehiculos_reservaId_fkey";

-- DropForeignKey
ALTER TABLE "ocupacion_vehiculos" DROP CONSTRAINT "ocupacion_vehiculos_vehiculoId_fkey";

-- DropTable
DROP TABLE "carritos";

-- DropTable
DROP TABLE "items_carrito";

-- DropTable
DROP TABLE "metodos_pago";

-- DropTable
DROP TABLE "notificaciones";

-- DropTable
DROP TABLE "ocupacion_vehiculos";

-- DropEnum
DROP TYPE "CanalNotificacion";

-- DropEnum
DROP TYPE "EstadoCarrito";

-- DropEnum
DROP TYPE "EstadoNotificacion";

-- DropEnum
DROP TYPE "TipoItemCarrito";
