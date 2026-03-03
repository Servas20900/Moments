import { Injectable, NotFoundException, Logger, BadRequestException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { EstadoReserva } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import { InvoiceService } from "../../common/invoice/invoice.service";
import { NotificacionesService } from "../notificaciones/notificaciones.service";
import { CreateReservationDto } from "./dtos/create-reservation.dto";
import { CreateManualReservationDto } from "./dtos/create-manual-reservation.dto";

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private invoiceService: InvoiceService,
    private notificacionesService: NotificacionesService,
  ) {}

  async create(
    dto: CreateReservationDto,
    metadata?: {
      ipCliente?: string | null;
      userAgent?: string | null;
      metadatosContracargo?: any;
    },
  ) {
    if (!dto.aceptoTerminos) {
      throw new BadRequestException('Debes aceptar los términos y condiciones para continuar con la reserva');
    }

    const userId =
      dto.usuarioId ??
      (await this.ensureUser(dto.email, dto.nombre, dto.telefono));
    const paqueteId = dto.paqueteId;
    const vehiculoId = dto.vehiculoId;

    if (!paqueteId) throw new NotFoundException("paqueteId es requerido");
    if (!vehiculoId) throw new NotFoundException("vehiculoId es requerido");

    await this.ensureVehicleBelongsToPackage(paqueteId, vehiculoId);

    const fechaEvento = new Date(dto.fechaEvento);
    if (isNaN(fechaEvento.getTime())) {
      throw new BadRequestException("fechaEvento inválida");
    }

    await this.ensureVehicleAvailabilityForDate(vehiculoId, fechaEvento);

    const extrasInput = Array.isArray(dto.extras) ? dto.extras.map((x) => ({ extraId: x.extraId, cantidad: x.cantidad })) : [];
    const { precioBase, precioTotal, restante, anticipo, extrasConPrecio } = await this.computePricesFromPaqueteAndExtras(
      paqueteId,
      extrasInput,
      dto.anticipo ?? 0,
    );

    const created = await this.createReservationWithInvoice({
      usuarioId: userId,
      paqueteId,
      vehiculoId,
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      identificacion: dto.numeroIdentificacion ?? null,
      direccion: dto.direccion ?? null,
      tipoIdentificacion: dto.tipoIdentificacion ?? null,
      tipoEvento: dto.tipoEvento,
      fechaEvento,
      origen: dto.origen,
      destino: dto.destino,
      numeroPersonas: dto.numeroPersonas,
      precioBase,
      precioTotal,
      anticipo,
      restante,
      estado: "PAGO_PENDIENTE",
      tipoPago: dto.tipoPago as any,
      aceptoTerminos: true,
      terminosAceptadosEn: new Date(),
      terminosVersion: dto.terminosVersion ?? 'v1-2026-03',
      ipCliente: metadata?.ipCliente ?? null,
      userAgent: metadata?.userAgent ?? null,
      metadatosContracargo: metadata?.metadatosContracargo ?? null,
    });

    if (extrasConPrecio.length > 0) {
      await this.prisma.reservaExtra.createMany({
        data: extrasConPrecio.map((e) => ({
          reservaId: created.id,
          extraId: e.extraId,
          cantidad: e.cantidad,
          precioUnitario: e.precioUnitario,
        })),
      });
    }

    // Crear notificación para el usuario
    if (userId) {
      try {
        const paquete = await this.prisma.paquete.findUnique({ where: { id: paqueteId } });
        await this.notificacionesService.crearNotificacion(
          userId,
          'Nueva Reserva Creada',
          `Tu reserva para ${paquete?.nombre || 'el paquete'} el ${fechaEvento.toLocaleDateString('es-CR')} ha sido creada exitosamente.`,
          'RESERVA',
          created.id
        );
      } catch (error) {
        this.logger.error(`Error al crear notificación para reserva #${created.id}:`, error);
      }
    }

    // Enviar correo de confirmación para todos los métodos de pago
    try {
      const paquete = await this.prisma.paquete.findUnique({ where: { id: paqueteId } });
      await this.emailService.sendReservationConfirmation({
        nombre: created.nombre,
        email: created.email,
        reservaId: created.id,
        numeroFactura: created.numeroFactura ?? undefined,
        anticipo: Number(created.anticipo),
        total: Number(created.precioTotal),
        fecha: created.fechaEvento,
        origen: created.origen,
        destino: created.destino,
        numeroPersonas: created.numeroPersonas,
        paquete: paquete?.nombre || 'Paquete',
        telefono: created.telefono,
        direccion: created.direccion ?? undefined,
        tipoPago: created.tipoPago ?? dto.tipoPago ?? undefined,
      });
      this.logger.log(`Correo de confirmación enviado para reserva #${created.id}`);
    } catch (error) {
      this.logger.error(`Error al enviar correo de confirmación para reserva #${created.id}:`, error);
      // No falla la reserva si el correo falla
    }

    return this.toResponse(created);
  }

  async findAll(filters?: {
    vehiculoId?: string;
    estado?: string;
    desde?: string;
    hasta?: string;
  }) {
    const where: any = {};

    if (filters?.vehiculoId) {
      where.vehiculoId = filters.vehiculoId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.desde || filters?.hasta) {
      where.fechaEvento = {};
      if (filters.desde) {
        where.fechaEvento.gte = new Date(filters.desde);
      }
      if (filters.hasta) {
        where.fechaEvento.lte = new Date(filters.hasta);
      }
    }

    const items = await this.prisma.reserva.findMany({
      where,
      orderBy: { creadoEn: "desc" },
    });
    return items.map((r) => this.toResponse(r));
  }

  async findAllWithFilters(query: any) {
    const {
      vehiculoId,
      estadoPago,
      tipoEvento,
      origenReserva,
      contactoCliente,
      conConflictos,
      fechaDesde,
      fechaHasta,
      busqueda,
      sortBy = 'fechaEvento',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    const skip = (page - 1) * limit;

    if (vehiculoId) {
      where.vehiculoId = vehiculoId;
    }

    if (estadoPago) {
      if (estadoPago === 'pendiente') {
        where.estado = 'PAGO_PENDIENTE';
      } else if (estadoPago === 'parcial') {
        where.estado = 'PAGO_PARCIAL';
      } else if (estadoPago === 'completo') {
        where.estado = 'CONFIRMADA';
      }
    }

    if (tipoEvento) {
      const now = new Date();
      if (tipoEvento === 'futuro') {
        where.fechaEvento = { gt: now };
      } else if (tipoEvento === 'hoy') {
        const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endDay = new Date(startDay.getTime() + 24 * 60 * 60 * 1000);
        where.fechaEvento = { gte: startDay, lt: endDay };
      } else if (tipoEvento === 'pasado') {
        where.fechaEvento = { lt: now };
      }
    }

    if (origenReserva) {
      where.origenReserva = origenReserva;
    }

    if (contactoCliente) {
      where.contactoCliente = contactoCliente;
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { telefono: { contains: busqueda, mode: 'insensitive' } },
        { numeroFactura: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (fechaDesde || fechaHasta) {
      where.fechaEvento = {};
      if (fechaDesde) {
        where.fechaEvento.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaEvento.lte = new Date(fechaHasta);
      }
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [items, total] = await Promise.all([
      this.prisma.reserva.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          vehiculo: { select: { nombre: true } },
          paquete: { select: { nombre: true } },
          extras: {
            include: {
              extra: { select: { nombre: true } },
            },
          },
        },
      }),
      this.prisma.reserva.count({ where }),
    ]);

    return {
      items: items.map((r) => this.toResponseAdminTable(r)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async confirmAdelanto(reservaId: string, actor: string = 'Sistema') {
    const updated = await this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          adelantoRecibido: true,
          estado: 'PAGO_PARCIAL',
        },
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: actor,
        comentario: 'Confirmación de adelanto recibida',
        origenCambio: 'CONFIRMACION_ADELANTO',
      });

      return updatedReserva;
    });

    if (updated.numeroFactura) return updated;
    return this.assignInvoiceNumberIfMissing(reservaId);
  }

  async confirmPagoCompleto(reservaId: string, actor: string = 'Sistema') {
    const updated = await this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          pagoCompleto: true,
          estado: 'CONFIRMADA',
        },
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: actor,
        comentario: 'Confirmación de pago completo',
        origenCambio: 'CONFIRMACION_PAGO_COMPLETO',
      });

      return updatedReserva;
    });

    if (updated.numeroFactura) return updated;
    return this.assignInvoiceNumberIfMissing(reservaId);
  }

  async createManual(dto: CreateManualReservationDto, adminUser: string) {
    const paqueteId = dto.paqueteId;
    const vehiculoId = dto.vehiculoId;

    if (!paqueteId) throw new NotFoundException("paqueteId es requerido");
    if (!vehiculoId) throw new NotFoundException("vehiculoId es requerido");

    await this.ensureVehicleBelongsToPackage(paqueteId, vehiculoId);

    const fechaEvento = new Date(dto.fechaEvento);
    if (isNaN(fechaEvento.getTime())) {
      throw new BadRequestException("fechaEvento inválida");
    }

    await this.ensureVehicleAvailabilityForDate(vehiculoId, fechaEvento);

    const estado = dto.estadoInicial ?? dto.estado ?? 'PAGO_PENDIENTE';

    const extrasInput = Array.isArray(dto.extras)
      ? dto.extras.map((x) => ({
          extraId: x.extraId,
          cantidad: x.cantidad,
          precioUnitario: x.precioUnitario,
        }))
      : [];

    const { precioBase, precioTotal, restante, anticipo, extrasConPrecio } = await this.computePricesFromPaqueteAndExtras(
      paqueteId,
      extrasInput,
      dto.anticipo ?? 0,
      true,
    );

    const created = await this.createReservationWithInvoice({
      nombre: dto.nombre,
      email: dto.email,
      telefono: dto.telefono,
      identificacion: dto.identificacion ?? null,
      tipoEvento: dto.tipoEvento,
      fechaEvento,
      origen: dto.origen,
      destino: dto.destino,
      numeroPersonas: dto.numeroPersonas,
      precioBase,
      precioTotal,
      anticipo,
      restante,
      estado,
      tipoPago: dto.tipoPago as any,
      paqueteId,
      vehiculoId,
      origenReserva: dto.origenReserva || 'MANUAL',
      notasInternas: dto.notasInternas ?? null,
    });

    if (extrasConPrecio.length > 0) {
      await this.prisma.reservaExtra.createMany({
        data: extrasConPrecio.map((e) => ({
          reservaId: created.id,
          extraId: e.extraId,
          cantidad: e.cantidad,
          precioUnitario: e.precioUnitario,
        })),
      });
    }

    return this.toResponse(created);
  }

  async markPaymentCompleteManual(reservaId: string, dto: any, adminUser: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          pagoCompleto: true,
          estado: 'CONFIRMADA',
          tipoPago: dto.tipoPago,
          notasInternas: (reserva.notasInternas || '') + `\n[${new Date().toLocaleString()}] ${adminUser} marcó pago completo (${dto.tipoPago})${dto.comentario ? ': ' + dto.comentario : ''}`,
        },
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: adminUser,
        comentario: dto.comentario || `Pago completo manual (${dto.tipoPago})`,
        origenCambio: 'PAGO_COMPLETO_MANUAL',
      });

      return updatedReserva;
    });

    if (updated.numeroFactura) return updated;
    return this.assignInvoiceNumberIfMissing(reservaId);
  }

  async updateReservation(reservaId: string, dto: any, adminUser: string) {
    return this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updateData: any = {};

      // Solo ciertos campos pueden ser editados
      if (dto.estado !== undefined) {
        updateData.estado = dto.estado;
      }
      if (dto.vehiculoId !== undefined) {
        if (!dto.vehiculoId) {
          throw new BadRequestException('vehiculoId inválido');
        }
        await this.ensureVehicleBelongsToPackage(reserva.paqueteId, dto.vehiculoId);
        updateData.vehiculoId = dto.vehiculoId;
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: updateData,
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: adminUser,
        comentario: dto.comentario || 'Cambio manual de estado',
        origenCambio: 'CAMBIO_ESTADO_MANUAL',
      });

      return updatedReserva;
    });
  }

  async updateContactoCliente(reservaId: string, contactoCliente: string, adminUser: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
    }

    return this.prisma.reserva.update({
      where: { id: reservaId },
      data: {
        contactoCliente: contactoCliente as any,
      },
    });
  }

  async updateAdelantoRecibido(reservaId: string, adelantoRecibido: boolean, adminUser: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
    }

    const updated = await this.prisma.reserva.update({
      where: { id: reservaId },
      data: {
        adelantoRecibido,
      },
    });

    if (!adelantoRecibido || updated.numeroFactura) return updated;
    return this.assignInvoiceNumberIfMissing(reservaId);
  }

  async updatePagoCompleto(reservaId: string, pagoCompleto: boolean, adminUser: string) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          pagoCompleto,
          estado: pagoCompleto ? 'CONFIRMADA' : reserva.estado,
        },
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: adminUser,
        comentario: pagoCompleto ? 'Actualización de pago completo' : 'Reversión de bandera pago completo',
        origenCambio: 'ACTUALIZACION_PAGO_COMPLETO',
      });

      return updatedReserva;
    });

    if (!pagoCompleto || updated.numeroFactura) return updated;
    return this.assignInvoiceNumberIfMissing(reservaId);
  }

  async updateChoferAsignado(reservaId: string, choferAsignado: boolean, adminUser: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
    }

    return this.prisma.reserva.update({
      where: { id: reservaId },
      data: {
        choferAsignado,
      },
    });
  }

  async updateEventoRealizado(reservaId: string, eventoRealizado: boolean, adminUser: string) {
    return this.prisma.$transaction(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id: reservaId },
      });

      if (!reserva) {
        throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
      }

      const updatedReserva = await tx.reserva.update({
        where: { id: reservaId },
        data: {
          eventoRealizado,
          estado: eventoRealizado ? 'COMPLETADA' : reserva.estado,
        },
      });

      await this.registrarCambioEstadoSiAplica(tx, {
        reservaId,
        estadoAnterior: reserva.estado as EstadoReserva,
        estadoNuevo: updatedReserva.estado as EstadoReserva,
        ejecutadoPor: adminUser,
        comentario: eventoRealizado ? 'Evento marcado como realizado' : 'Reversión de evento realizado',
        origenCambio: 'ACTUALIZACION_EVENTO_REALIZADO',
      });

      return updatedReserva;
    });
  }

  private async registrarCambioEstadoSiAplica(
    tx: any,
    data: {
      reservaId: string;
      estadoAnterior: EstadoReserva;
      estadoNuevo: EstadoReserva;
      ejecutadoPor: string;
      comentario?: string;
      origenCambio: string;
    },
  ) {
    if (data.estadoAnterior === data.estadoNuevo) {
      return;
    }

    await tx.historialEstadoReserva.create({
      data: {
        reservaId: data.reservaId,
        estadoAnterior: data.estadoAnterior,
        estado: data.estadoNuevo,
        ejecutadoPor: data.ejecutadoPor || 'Sistema',
        comentario: data.comentario,
        origenCambio: data.origenCambio,
      },
    });
  }

  private toResponse(r: any) {
    return {
      id: r.id,
      numeroFactura: r.numeroFactura ?? null,
      nombre: r.nombre,
      email: r.email,
      telefono: r.telefono,
      estado: r.estado,
      fechaEvento: r.fechaEvento,
      numeroPersonas: r.numeroPersonas,
      precioTotal: Number(r.precioTotal),
      paqueteId: r.paqueteId,
      vehiculoId: r.vehiculoId,
    };
  }

  private toResponseAdminTable(r: any) {
    const extras = (r.extras ?? []).map((re: any) => ({
      nombre: re.extra?.nombre ?? 'Extra',
      cantidad: Number(re.cantidad ?? 1),
      precioUnitario: Number(re.precioUnitario ?? 0),
    }));
    return {
      id: r.id,
      numeroFactura: r.numeroFactura ?? null,
      nombre: r.nombre,
      email: r.email,
      telefono: r.telefono,
      estado: r.estado,
      fechaEvento: r.fechaEvento,
      numeroPersonas: r.numeroPersonas,
      precioTotal: Number(r.precioTotal),
      restante: Number(r.restante ?? 0),
      paqueteId: r.paqueteId,
      vehiculoId: r.vehiculoId,
      contactoCliente: r.contactoCliente ?? 'PENDIENTE',
      adelantoRecibido: r.adelantoRecibido ?? false,
      pagoCompleto: r.pagoCompleto ?? false,
      eventoRealizado: r.eventoRealizado ?? false,
      vehiculo: r.vehiculo ? { nombre: r.vehiculo.nombre } : null,
      paquete: r.paquete ? { nombre: r.paquete.nombre } : null,
      extras,
      tieneConflicto: false,
    };
  }

  private async createReservationWithInvoice(data: any) {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const numeroFactura = await this.invoiceService.generateInvoiceNumber();
      try {
        return await this.prisma.reserva.create({
          data: {
            ...data,
            numeroFactura,
          },
        });
      } catch (error) {
        if (this.isInvoiceConflictError(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException('No se pudo generar un número de factura único');
  }

  private async assignInvoiceNumberIfMissing(reservaId: string) {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const numeroFactura = await this.invoiceService.generateInvoiceNumber();
      try {
        const updateResult = await this.prisma.reserva.updateMany({
          where: {
            id: reservaId,
            numeroFactura: null,
          },
          data: {
            numeroFactura,
          },
        });

        const reserva = await this.prisma.reserva.findUnique({ where: { id: reservaId } });
        if (!reserva) {
          throw new NotFoundException(`Reserva #${reservaId} no encontrada`);
        }

        if (updateResult.count === 1 || reserva.numeroFactura) {
          return reserva;
        }
      } catch (error) {
        if (this.isInvoiceConflictError(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new InternalServerErrorException(`No se pudo asignar número de factura a la reserva #${reservaId}`);
  }

  private isInvoiceConflictError(error: any): boolean {
    const target = error?.meta?.target;
    const hasNumeroFacturaTarget = Array.isArray(target)
      ? target.includes('numeroFactura')
      : typeof target === 'string' && target.includes('numeroFactura');
    return error?.code === 'P2002' && hasNumeroFacturaTarget;
  }

  /**
   * Calcula precios desde BD (paquete + extras). Fuente de verdad para evitar manipulación desde el front.
   * Usado por create() (web) y createManual() (admin).
   */
  private async computePricesFromPaqueteAndExtras(
    paqueteId: string,
    extrasInput: Array<{ extraId: string; cantidad?: number; precioUnitario?: number }>,
    anticipoInput: number,
    validateProvidedUnitPrice: boolean = false,
  ): Promise<{
    precioBase: number;
    precioTotal: number;
    restante: number;
    anticipo: number;
    extrasConPrecio: Array<{ extraId: string; cantidad: number; precioUnitario: number }>;
  }> {
    const paquete = await this.prisma.paquete.findUnique({
      where: { id: paqueteId },
      select: { precioBase: true },
    });
    if (!paquete) throw new NotFoundException("Paquete no encontrado");
    const precioBase = Number(paquete.precioBase ?? 0);

    const extrasConPrecio: Array<{ extraId: string; cantidad: number; precioUnitario: number }> = [];
    let totalExtras = 0;
    for (const item of extrasInput.filter((x) => x.extraId)) {
      const cantidad = Number(item.cantidad ?? 1);
      if (cantidad < 1) continue;
      const extra = await this.prisma.extra.findUnique({
        where: { id: item.extraId },
        select: { precio: true },
      });
      if (!extra) continue;
      const precioUnitario = Number(extra.precio ?? 0);
      if (
        validateProvidedUnitPrice &&
        item.precioUnitario !== undefined &&
        item.precioUnitario !== null
      ) {
        const providedUnitPrice = Number(item.precioUnitario);
        if (!Number.isFinite(providedUnitPrice) || providedUnitPrice < 0) {
          throw new BadRequestException(`Precio unitario inválido para extra ${item.extraId}`);
        }

        if (Math.abs(providedUnitPrice - precioUnitario) > 0.01) {
          throw new BadRequestException(`El precio del extra ${item.extraId} no coincide con el catálogo actual`);
        }
      }
      totalExtras += precioUnitario * cantidad;
      extrasConPrecio.push({ extraId: item.extraId, cantidad, precioUnitario });
    }

    const precioTotal = precioBase + totalExtras;
    const anticipo = Math.max(0, Math.min(Number(anticipoInput) || 0, precioTotal));
    const restante = Math.max(0, precioTotal - anticipo);

    return { precioBase, precioTotal, restante, anticipo, extrasConPrecio };
  }

  private async ensureVehicleAvailabilityForDate(vehiculoId: string, fechaEvento: Date) {
    const start = new Date(fechaEvento);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { id: true, cantidad: true, estado: true },
    });

    if (!vehiculo || vehiculo.estado !== "ACTIVO") {
      throw new NotFoundException("Vehículo no disponible");
    }

    const bloqueado = await this.prisma.disponibilidadVehiculo.findFirst({
      where: {
        vehiculoId,
        fecha: { gte: start, lt: end },
      },
      select: { id: true },
    });

    if (bloqueado) {
      throw new BadRequestException("El vehículo está bloqueado administrativamente para esa fecha");
    }

    const reservasActivas = await this.prisma.reserva.count({
      where: {
        vehiculoId,
        fechaEvento: { gte: start, lt: end },
        estado: { in: ["CONFIRMADA", "PAGO_PARCIAL"] },
      },
    });

    if (reservasActivas >= (vehiculo.cantidad ?? 1)) {
      throw new BadRequestException("No hay cupo disponible para ese vehículo en la fecha seleccionada");
    }
  }

  private async ensureVehicleBelongsToPackage(paqueteId: string, vehiculoId: string) {
    const relation = await this.prisma.paqueteVehiculo.findUnique({
      where: {
        paqueteId_vehiculoId: {
          paqueteId,
          vehiculoId,
        },
      },
      select: { paqueteId: true },
    });

    if (!relation) {
      throw new BadRequestException("El vehículo seleccionado no está asignado al paquete elegido");
    }
  }

  private async ensureUser(email: string, nombre: string, telefono?: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.usuario.findUnique({ where: { email: normalizedEmail } });
    if (existing) return existing.id;
    const temporaryPassword = randomBytes(24).toString("base64url");
    const hashed = await bcrypt.hash(temporaryPassword, 10);
    const user = await this.prisma.usuario.create({
      data: {
        email: normalizedEmail,
        contrasena: hashed,
        nombre: nombre || email,
        telefono: telefono || "",
        estado: "ACTIVO",
      },
    });

    // Asignar rol de usuario
    const rolUsuario = await this.prisma.rol.findFirst({
      where: { codigo: "USER" },
    });
    if (rolUsuario) {
      await this.prisma.usuarioRol.create({
        data: {
          usuarioId: user.id,
          rolId: rolUsuario.id,
        },
      });
    }

    return user.id;
  }

  private async firstActivePackage() {
    const pkg = await this.prisma.paquete.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: { creadoEn: "desc" },
    });
    return pkg?.id;
  }

  private async firstActiveVehicle() {
    const vehicle = await this.prisma.vehiculo.findFirst({
      where: { estado: "ACTIVO" },
      orderBy: { creadoEn: "desc" },
    });
    return vehicle?.id;
  }
}
