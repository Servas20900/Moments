import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVehicleDto } from './dtos/create-vehicle.dto';
import { UpdateVehicleDto } from './dtos/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private slugify(nombre: string) {
    return nombre
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async findAll() {
    const items = await this.prisma.vehiculo.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
          take: 1,
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
    return items.map((v) => this.toResponse(v));
  }

  async findById(id: string) {
    const v = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: {
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
        },
      },
    });
    if (!v || v.estado !== 'ACTIVO') throw new NotFoundException('Vehiculo no encontrado');
    return this.toResponse(v);
  }

  async create(dto: CreateVehicleDto) {
    const created = await this.prisma.vehiculo.create({
      data: {
        nombre: dto.nombre,
        categoria: dto.categoria,
        asientos: dto.asientos,
        tarifaPorHora: dto.tarifaPorHora,
        estado: 'ACTIVO',
      },
    });
    return this.toResponse(created);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const existing = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vehiculo no encontrado');

    const updated = await this.prisma.vehiculo.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? existing.nombre,
        categoria: dto.categoria ?? existing.categoria,
        asientos: dto.asientos ?? existing.asientos,
        tarifaPorHora: dto.tarifaPorHora ?? existing.tarifaPorHora,
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vehiculo no encontrado');
    await this.prisma.vehiculo.update({ where: { id }, data: { estado: 'INACTIVO' } });
    return { message: 'Vehiculo desactivado' };
  }

  private toResponse(v: any) {
    const imgUrl = v.imagenes?.[0]?.imagen?.url || v.imagenUrl || null;
    return {
      id: v.id,
      name: v.nombre,
      category: v.categoria,
      seats: v.asientos,
      rate: Number(v.tarifaPorHora),
      imageUrl: imgUrl,
      estado: v.estado,
    };
  }
}