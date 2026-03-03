-- Historial estructurado de cambios de estado de reservas
ALTER TABLE "historial_estados_reserva"
  ADD COLUMN "estadoAnterior" "EstadoReserva",
  ADD COLUMN "ejecutadoPor" TEXT,
  ADD COLUMN "origenCambio" TEXT;

UPDATE "historial_estados_reserva"
SET
  "estadoAnterior" = "estado",
  "ejecutadoPor" = COALESCE("ejecutadoPor", 'Sistema'),
  "origenCambio" = COALESCE("origenCambio", 'MIGRACION');

ALTER TABLE "historial_estados_reserva"
  ALTER COLUMN "estadoAnterior" SET NOT NULL,
  ALTER COLUMN "ejecutadoPor" SET NOT NULL,
  ALTER COLUMN "origenCambio" SET NOT NULL;