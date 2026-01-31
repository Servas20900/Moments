-- CreateTable
CREATE TABLE "extras" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes_extras" (
    "paqueteId" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,

    CONSTRAINT "paquetes_extras_pkey" PRIMARY KEY ("paqueteId","extraId")
);

-- CreateTable
CREATE TABLE "reservas_extras" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "extraId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precioUnitario" DECIMAL(10,2) NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_extras_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paquetes_extras" ADD CONSTRAINT "paquetes_extras_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes_extras" ADD CONSTRAINT "paquetes_extras_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_extras" ADD CONSTRAINT "reservas_extras_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_extras" ADD CONSTRAINT "reservas_extras_extraId_fkey" FOREIGN KEY ("extraId") REFERENCES "extras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
