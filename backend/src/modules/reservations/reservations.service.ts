import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReservationDto } from './dtos/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateReservationDto) {
    const userId = dto.usuarioId ?? (await this.ensureUser(dto.email, dto.nombre, dto.telefono));
    const paqueteId = dto.paqueteId;
    const vehiculoId = dto.vehiculoId;

    if (!paqueteId) throw new NotFoundException('paqueteId es requerido');
    if (!vehiculoId) throw new NotFoundException('vehiculoId es requerido');

    const fechaEvento = new Date(dto.fechaEvento);
    const horaInicio = new Date(dto.horaInicio);
    const horaFin = new Date(dto.horaFin);

    const created = await this.prisma.reserva.create({
      data: {
        usuarioId: userId,
        paqueteId,
        vehiculoId,
        conductorId: dto.conductorId,
        nombre: dto.nombre,
        email: dto.email,
        telefono: dto.telefono,
        identificacion: dto.identificacion,
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
        estado: 'PAGO_PENDIENTE',
        tipoPago: dto.tipoPago as any,
      },
    });

    return this.toResponse(created);
  }

  async findAll() {
    const items = await this.prisma.reserva.findMany({ orderBy: { creadoEn: 'desc' } });
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
    const hashed = await bcrypt.hash('Temp1234!', 10);
    const user = await this.prisma.usuario.create({
      data: {
        email,
        contrasena: hashed,
        nombre: nombre || email,
        telefono: telefono || '',
        estado: 'ACTIVO',
      },
    });

    // Asignar rol de usuario
    const rolUsuario = await this.prisma.rol.findFirst({
      where: { codigo: 'USER' },
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
    const pkg = await this.prisma.paquete.findFirst({ where: { estado: 'ACTIVO' }, orderBy: { creadoEn: 'desc' } });
    return pkg?.id;
  }

  private async firstActiveVehicle() {
    const vehicle = await this.prisma.vehiculo.findFirst({ where: { estado: 'ACTIVO' }, orderBy: { creadoEn: 'desc' } });
    return vehicle?.id;
  }
}