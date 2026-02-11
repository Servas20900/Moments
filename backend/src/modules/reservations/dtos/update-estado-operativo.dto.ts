import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum EstadoContacto {
  PENDIENTE = 'PENDIENTE',
  CONTACTADO = 'CONTACTADO',
  CONFIRMADO = 'CONFIRMADO',
}

export class UpdateEstadoContactoDto {
  @IsEnum(EstadoContacto)
  contactoCliente: EstadoContacto;
}

export class UpdateAdelantoRecibidoDto {
  @IsBoolean()
  adelantoRecibido: boolean;
}

export class UpdatePagoCompletoDto {
  @IsBoolean()
  pagoCompleto: boolean;
}

export class UpdateChoferAsignadoDto {
  @IsBoolean()
  choferAsignado: boolean;
}

export class UpdateEventoRealizadoDto {
  @IsBoolean()
  eventoRealizado: boolean;
}

export class QueryReservasDto {
  @IsOptional()
  vehiculoId?: string;

  @IsOptional()
  estadoPago?: 'pendiente' | 'parcial' | 'completo';

  @IsOptional()
  tipoEvento?: 'futuro' | 'hoy' | 'pasado';

  @IsOptional()
  origenReserva?: string;

  @IsOptional()
  contactoCliente?: EstadoContacto;

  @IsOptional()
  conConflictos?: boolean;

  @IsOptional()
  fechaDesde?: string;

  @IsOptional()
  fechaHasta?: string;

  @IsOptional()
  busqueda?: string;

  @IsOptional()
  sortBy?: 'fechaEvento' | 'actualizadoEn' | 'conflictos';

  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}
