import { Injectable, NotFoundException, Logger, BadRequestException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import { CreateReservationDto } from "./dtos/create-reservation.dto";

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateReservationDto) {
    const userId =
      dto.usuarioId ??
      (await this.ensureUser(dto.email, dto.nombre, dto.telefono));
    const paqueteId = dto.paqueteId;
    const vehiculoId = dto.vehiculoId;

    if (!paqueteId) throw new NotFoundException("paqueteId es requerido");
    if (!vehiculoId) throw new NotFoundException("vehiculoId es requerido");

    const fechaEvento = new Date(dto.fechaEvento);
    const horaInicio = new Date(dto.horaInicio);
    const horaFin = new Date(dto.horaFin);

    if (!(horaInicio instanceof Date) || isNaN(horaInicio.getTime())) {
      throw new BadRequestException("horaInicio inválida");
    }
    if (!(horaFin instanceof Date) || isNaN(horaFin.getTime())) {
      throw new BadRequestException("horaFin inválida");
    }
    if (horaFin <= horaInicio) {
      throw new BadRequestException("horaFin debe ser mayor que horaInicio");
    }

    const paquete = await this.prisma.paquete.findUnique({
      where: { id: paqueteId },
      include: { vehiculos: true },
    });

    if (!paquete) {
      throw new NotFoundException("Paquete no encontrado");
    }

    const allowedVehicleIds = paquete.vehiculos?.map((v) => v.vehiculoId) ?? [];
    if (allowedVehicleIds.length > 0 && !allowedVehicleIds.includes(vehiculoId)) {
      throw new BadRequestException("El vehículo no pertenece al paquete seleccionado");
    }

    const conflicting = await this.prisma.reserva.findFirst({
      where: {
        vehiculoId,
        estado: { in: ["PAGO_PENDIENTE", "CONFIRMADA", "COMPLETADA"] },
        horaInicio: { lt: horaFin },
        horaFin: { gt: horaInicio },
      },
      select: { id: true },
    });

    if (conflicting) {
      throw new BadRequestException("El vehículo ya está reservado en ese horario");
    }

    // Placeholder for future enhancement: consider including extras in reservation creation
    const created = await this.prisma.reserva.create({
      data: {
        usuarioId: userId,
        paqueteId,
        vehiculoId,
        conductorId: dto.conductorId,
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        identificacion: dto.numeroIdentificacion ?? null,
        tipoEvento: dto.tipoEvento,
        fechaEvento,
        horaInicio,
        horaFin,
        origen: dto.origen,
        destino: dto.destino,
        numeroPersonas: dto.numeroPersonas,
        precioBase: dto.precioBase ?? 0,
        precioTotal: dto.precioTotal ?? 0,
        anticipo: dto.anticipo ?? 0,
        restante: dto.restante ?? 0,
        estado: "PAGO_PENDIENTE",
        tipoPago: dto.tipoPago as any,
      },
    });

    // Registrar extras, si se enviaron
    if (Array.isArray(dto.extras) && dto.extras.length) {
      const extrasData = dto.extras.filter((x) => x.extraId);
      
      if (extrasData.length) {
        // Validar que los extras existan y estén activos (ignorar inválidos, no fallar)
        const extraIds = extrasData.map((x) => x.extraId);
        const existingExtras = await this.prisma.extra.findMany({
          where: { 
            id: { in: extraIds },
            estado: 'ACTIVO'
          },
          select: { id: true }
        });
        
        const existingIds = new Set(existingExtras.map((e) => e.id));
        const validExtrasData = extrasData.filter((x) => existingIds.has(x.extraId));
        
        if (validExtrasData.length > 0) {
          await this.prisma.reservaExtra.createMany({ 
            data: validExtrasData.map((x) => ({
              reservaId: created.id,
              extraId: x.extraId,
              cantidad: Number(x.cantidad ?? 1),
              precioUnitario: Number(x.precioUnitario ?? 0),
            }))
          });
          this.logger.log(`${validExtrasData.length} extras registrados para reserva #${created.id}`);
        } else {
          this.logger.warn(`Ninguno de los extras proporcionados existen o están activos para reserva #${created.id}`);
        }
      }
    }

    // Enviar correo de confirmación si el método de pago es SINPE
    if (dto.tipoPago === 'SINPE') {
      try {
        const paquete = await this.prisma.paquete.findUnique({ where: { id: paqueteId } });
        await this.emailService.sendReservationConfirmation({
          nombre: created.nombre,
          email: created.email,
          reservaId: created.id,
          anticipo: Number(created.anticipo),
          total: Number(created.precioTotal),
          fecha: created.fechaEvento,
          horaInicio: created.horaInicio,
          origen: created.origen,
          destino: created.destino,
          numeroPersonas: created.numeroPersonas,
          paquete: paquete?.nombre || 'Paquete',
          telefono: created.telefono,
          direccion: '',
        });
        this.logger.log(`Correo de confirmación enviado para reserva #${created.id}`);
      } catch (error) {
        this.logger.error(`Error al enviar correo de confirmación para reserva #${created.id}:`, error);
        // No falla la reserva si el correo falla
      }
    }

    return this.toResponse(created);
  }

  async findAll() {
    const items = await this.prisma.reserva.findMany({
      orderBy: { creadoEn: "desc" },
    });
    return items.map((r) => this.toResponse(r));
  }

  private toResponse(r: any) {
    return {
      id: r.id,
      nombre: r.nombre,
      email: r.email,
      telefono: r.telefono,
      estado: r.estado,
      fechaEvento: r.fechaEvento,
      horaInicio: r.horaInicio,
      horaFin: r.horaFin,
      numeroPersonas: r.numeroPersonas,
      precioTotal: Number(r.precioTotal),
      paqueteId: r.paqueteId,
      vehiculoId: r.vehiculoId,
    };
  }

  private async ensureUser(email: string, nombre: string, telefono?: string) {
    const existing = await this.prisma.usuario.findUnique({ where: { email } });
    if (existing) return existing.id;
    const hashed = await bcrypt.hash("Temp1234!", 10);
    const user = await this.prisma.usuario.create({
      data: {
        email,
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
