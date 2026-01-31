-- CreateTable
CREATE TABLE "paquetes_vehiculos" (
    "paqueteId" TEXT NOT NULL,
    "vehiculoId" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paquetes_vehiculos_pkey" PRIMARY KEY ("paqueteId","vehiculoId")
);

-- AddForeignKey
ALTER TABLE "paquetes_vehiculos" ADD CONSTRAINT "paquetes_vehiculos_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes_vehiculos" ADD CONSTRAINT "paquetes_vehiculos_vehiculoId_fkey" FOREIGN KEY ("vehiculoId") REFERENCES "vehiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
