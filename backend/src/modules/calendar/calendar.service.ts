import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CalendarInput {
  fecha: string;
  estado?: string;
  titulo?: string;
  detalle?: string;
  etiqueta?: string;
  imagenUrl?: string;
}

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  private toStatus(raw?: string): 'DISPONIBLE' | 'RESERVADO' | 'BLOQUEADO' {
    const val = (raw ?? '').toUpperCase();
    if (val === 'RESERVADO' || val === 'BOOKED') return 'RESERVADO';
    if (val === 'BLOQUEADO' || val === 'BLOCKED') return 'BLOQUEADO';
    return 'DISPONIBLE';
  }

  private toResponse(slot: any) {
    const imgUrl = slot.imagenes?.[0]?.imagen?.url || slot.imagenUrl || null;
    const dateStr = slot.fecha ? slot.fecha.toISOString().slice(0, 10) : '';
    console.log('[Calendar] toResponse - slot.fecha:', slot.fecha, '=> dateStr:', dateStr);
    return {
      id: slot.id,
      date: dateStr,
      status: slot.estado?.toLowerCase() === 'reservado' ? 'ocupado' : slot.estado?.toLowerCase() === 'bloqueado' ? 'evento' : 'disponible',
      title: slot.titulo,
      detail: slot.detalle,
      tag: slot.etiqueta,
      imageUrl: imgUrl,
    };
  }

  async findAll() {
    const items = await this.prisma.eventoCalendario.findMany({
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
          take: 1,
        },
      },
      orderBy: { fecha: 'asc' },
    });
    return items.map((i) => this.toResponse(i));
  }

  async create(body: CalendarInput) {
    console.log('[Calendar] create() called with body:', body);
    const created = await this.prisma.eventoCalendario.create({
      data: {
        fecha: new Date(body.fecha),
        titulo: body.titulo ?? 'Evento',
        estado: this.toStatus(body.estado),
        etiqueta: body.etiqueta,
        detalle: body.detalle,
      },
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
          take: 1,
        },
      },
    });
    console.log('[Calendar] created event:', created);
    return this.toResponse(created);
  }

  async update(id: string, body: Partial<CalendarInput>) {
    const existing = await this.prisma.eventoCalendario.findUnique({
      where: { id },
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
    if (!existing) throw new NotFoundException('Evento no encontrado');
    const updated = await this.prisma.eventoCalendario.update({
      where: { id },
      data: {
        fecha: body.fecha ? new Date(body.fecha) : existing.fecha,
        estado: body.estado ? this.toStatus(body.estado) : existing.estado,
        titulo: body.titulo ?? existing.titulo,
        detalle: body.detalle ?? existing.detalle,
        etiqueta: body.etiqueta ?? existing.etiqueta,
      },
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.eventoCalendario.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Evento no encontrado');
    await this.prisma.eventoCalendario.delete({ where: { id } });
    return { message: 'Evento eliminado' };
  }
}