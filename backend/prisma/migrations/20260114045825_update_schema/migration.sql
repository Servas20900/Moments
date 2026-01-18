/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `calendar_slots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `experiences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hero_slides` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `packages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reservations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vehicles` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PAGO_PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('DISPONIBLE', 'RESERVADO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('TARJETA', 'SINPE', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "EstadoNotificacion" AS ENUM ('ENVIADA', 'FALLIDA', 'PENDIENTE');

-- CreateEnum
CREATE TYPE "TipoItemCarrito" AS ENUM ('PAQUETE');

-- CreateEnum
CREATE TYPE "CategoriaImagen" AS ENUM ('LANDING_PAGE', 'EXPERIENCIA', 'GALERIA');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('ACTIVO', 'BLOQUEADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoCarrito" AS ENUM ('ACTIVO', 'CONVERTIDO', 'ABANDONADO');

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_packageId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_userId_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_packageId_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_userId_fkey";

-- DropTable
DROP TABLE "audit_logs";

-- DropTable
DROP TABLE "calendar_slots";

-- DropTable
DROP TABLE "experiences";

-- DropTable
DROP TABLE "hero_slides";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "packages";

-- DropTable
DROP TABLE "reservations";

-- DropTable
DROP TABLE "reviews";

-- DropTable
DROP TABLE "system_images";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "vehicles";

-- DropEnum
DROP TYPE "AuditAction";

-- DropEnum
DROP TYPE "CalendarEventType";

-- DropEnum
DROP TYPE "ExperienceStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "PackageStatus";

-- DropEnum
DROP TYPE "ReservationStatus";

-- DropEnum
DROP TYPE "UserRole";

-- DropEnum
DROP TYPE "UserStatus";

-- DropEnum
DROP TYPE "VehicleStatus";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "identificacion" TEXT,
    "distritoId" INTEGER,
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'ACTIVO',
    "ultimoAcceso" TIMESTAMP(3),
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "usuarioId" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "categorias_paquetes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes" (
    "id" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "maxPersonas" INTEGER NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "asientos" INTEGER NOT NULL,
    "tarifaPorHora" DECIMAL(10,2) NOT NULL,
    "imagenUrl" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_sistema" (
    "id" TEXT NOT NULL,
    "categoria" "CategoriaImagen" NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estaActiva" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imagenes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "paqueteId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "conductorId" TEXT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "identificacion" TEXT,
    "tipoEvento" TEXT NOT NULL,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "horaInicio" TIMESTAMP(3) NOT NULL,
    "horaFin" TIMESTAMP(3) NOT NULL,
    "origen" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "numeroPersonas" INTEGER NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "anticipo" DECIMAL(10,2) NOT NULL,
    "restante" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoReserva" NOT NULL,
    "tipoPago" "TipoPago",
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos_reservas" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "tipoPago" "TipoPago" NOT NULL,
    "referenciaExterna" TEXT,
    "comprobantePago" TEXT,
    "pagadoEn" TIMESTAMP(3),
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_calendario" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "estado" "EstadoEvento" NOT NULL,
    "etiqueta" TEXT,
    "detalle" TEXT,
    "imagenUrl" TEXT,
    "reservaId" TEXT,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_calendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocupacion_vehiculos" (
    "id" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "reservaId" TEXT,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ocupacion_vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "esPredeterminado" BOOLEAN NOT NULL DEFAULT false,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provincias" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provincias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cantones" (
    "id" SERIAL NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cantones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distritos" (
    "id" SERIAL NOT NULL,
    "cantonId" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "reservaId" TEXT,
    "canal" "CanalNotificacion" NOT NULL,
    "para" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado" "EstadoNotificacion" NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "enviadaEn" TIMESTAMP(3),
    "leidaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carritos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "sesionId" TEXT,
    "estado" "EstadoCarrito" NOT NULL DEFAULT 'ACTIVO',
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_carrito" (
    "id" TEXT NOT NULL,
    "carritoId" TEXT NOT NULL,
    "tipoItem" "TipoItemCarrito" NOT NULL,
    "paqueteId" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_reserva" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "estado" "EstadoReserva" NOT NULL,
    "comentario" TEXT,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "cambiadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_paquetes" (
    "id" TEXT NOT NULL,
    "paqueteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_paquetes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_paquetes_nombre_key" ON "categorias_paquetes"("nombre");

-- CreateIndex
CREATE INDEX "reservas_fechaEvento_idx" ON "reservas"("fechaEvento");

-- CreateIndex
CREATE INDEX "reservas_estado_idx" ON "reservas"("estado");

-- CreateIndex
CREATE INDEX "reservas_vehiculoId_fechaEvento_idx" ON "reservas"("vehiculoId", "fechaEvento");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_calendario_reservaId_key" ON "eventos_calendario"("reservaId");

-- CreateIndex
CREATE INDEX "ocupacion_vehiculos_vehiculoId_fecha_idx" ON "ocupacion_vehiculos"("vehiculoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ocupacion_vehiculos_vehiculoId_fecha_key" ON "ocupacion_vehiculos"("vehiculoId", "fecha");

-- CreateIndex
CREATE UNIQUE INDEX "provincias_codigo_key" ON "provincias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cantones_codigo_key" ON "cantones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "distritos_codigo_key" ON "distritos"("codigo");

-- CreateIndex
CREATE INDEX "historial_estados_reserva_reservaId_idx" ON "historial_estados_reserva"("reservaId");

-- CreateIndex
CREATE INDEX "historial_estados_reserva_cambiadoEn_idx" ON "historial_estados_reserva"("cambiadoEn");

-- CreateIndex
CREATE INDEX "imagenes_paquetes_paqueteId_orden_idx" ON "imagenes_paquetes"("paqueteId", "orden");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_distritoId_fkey" FOREIGN KEY ("distritoId") REFERENCES "distritos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes" ADD CONSTRAINT "paquetes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "conductores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos_reservas" ADD CONSTRAINT "pagos_reservas_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_vehiculos" ADD CONSTRAINT "ocupacion_vehiculos_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_vehiculos" ADD CONSTRAINT "ocupacion_vehiculos_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cantones" ADD CONSTRAINT "cantones_provinciaId_fkey" FOREIGN KEY ("provinciaId") REFERENCES "provincias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distritos" ADD CONSTRAINT "distritos_cantonId_fkey" FOREIGN KEY ("cantonId") REFERENCES "cantones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carritos" ADD CONSTRAINT "carritos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_carritoId_fkey" FOREIGN KEY ("carritoId") REFERENCES "carritos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_reserva" ADD CONSTRAINT "historial_estados_reserva_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_paquetes" ADD CONSTRAINT "imagenes_paquetes_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
