-- Evidencia mínima para blindaje ante contracargos
ALTER TABLE "reservas"
  ADD COLUMN "aceptoTerminos" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "terminosAceptadosEn" TIMESTAMP(3),
  ADD COLUMN "terminosVersion" TEXT,
  ADD COLUMN "ipCliente" TEXT,
  ADD COLUMN "userAgent" TEXT,
  ADD COLUMN "metadatosContracargo" JSONB;