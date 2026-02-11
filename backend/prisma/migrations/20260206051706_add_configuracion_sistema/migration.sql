-- AlterEnum
ALTER TYPE "EstadoReserva" ADD VALUE 'PAGO_PARCIAL';

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" SERIAL NOT NULL,
    "numeroSinpe" TEXT NOT NULL DEFAULT '8888-8888',
    "correoEmpresa" TEXT NOT NULL DEFAULT 'info@moments.cr',
    "mensajeAtencion48h" TEXT NOT NULL DEFAULT 'Respondemos en un plazo de 48 horas hábiles',
    "terminosCondiciones" TEXT NOT NULL DEFAULT 'Términos y condiciones generales',
    "politicasCancelacion" TEXT NOT NULL DEFAULT 'Políticas de cancelación',
    "nombreEmpresa" TEXT NOT NULL DEFAULT 'Moments Transportation CR',
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);
