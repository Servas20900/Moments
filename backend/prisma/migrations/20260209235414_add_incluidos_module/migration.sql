-- CreateTable
CREATE TABLE "categorias_incluidos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_incluidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incluidos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "estado" "EstadoActivo" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incluidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paquetes_incluidos" (
    "paqueteId" TEXT NOT NULL,
    "incluidoId" TEXT NOT NULL,

    CONSTRAINT "paquetes_incluidos_pkey" PRIMARY KEY ("paqueteId","incluidoId")
);

-- CreateTable
CREATE TABLE "reservas_incluidos" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "incluidoId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservas_incluidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_incluidos_nombre_key" ON "categorias_incluidos"("nombre");

-- AddForeignKey
ALTER TABLE "incluidos" ADD CONSTRAINT "incluidos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_incluidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes_incluidos" ADD CONSTRAINT "paquetes_incluidos_incluidoId_fkey" FOREIGN KEY ("incluidoId") REFERENCES "incluidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paquetes_incluidos" ADD CONSTRAINT "paquetes_incluidos_paqueteId_fkey" FOREIGN KEY ("paqueteId") REFERENCES "paquetes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_incluidos" ADD CONSTRAINT "reservas_incluidos_incluidoId_fkey" FOREIGN KEY ("incluidoId") REFERENCES "incluidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas_incluidos" ADD CONSTRAINT "reservas_incluidos_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
