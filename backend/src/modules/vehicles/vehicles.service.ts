import { Injectable, NotFoundException } from "@nestjs/common";
import { EstadoActivo } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateVehicleDto } from "./dtos/create-vehicle.dto";
import { UpdateVehicleDto } from "./dtos/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  private slugify(nombre: string) {
    return nombre
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  async findAll(params: { skip?: number; take?: number; categoriaId?: number; estado?: string }) {
    const { skip = 0, take = 10, categoriaId, estado = "ACTIVO" } = params;

    const normalizedEstado = Object.values(EstadoActivo).includes(estado as EstadoActivo)
      ? (estado as EstadoActivo)
      : EstadoActivo.ACTIVO;

    const where = {
      estado: normalizedEstado,
      ...(categoriaId ? { categoriaId } : {}),
    } as const;

    const [items, total] = await Promise.all([
      this.prisma.vehiculo.findMany({
        where,
        skip,
        take,
        include: {
          categoria: true,
          imagenes: {
            include: { imagen: true },
            orderBy: { orden: "asc" },
            take: 1,
          },
        },
        orderBy: { creadoEn: "desc" },
      }),
      this.prisma.vehiculo.count({ where }),
    ]);

    return { data: items.map((v) => this.toResponse(v)), total, skip, take };
  }

  async findById(id: string) {
    const v = await this.prisma.vehiculo.findUnique({
      where: { id },
      include: {
        categoria: true,
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: "asc" },
        },
      },
    });
    if (!v || v.estado !== "ACTIVO")
      throw new NotFoundException("Vehiculo no encontrado");
    return this.toResponse(v);
  }

  async create(dto: CreateVehicleDto) {
    const created = await this.prisma.vehiculo.create({
      data: {
        nombre: dto.nombre,
        categoriaId: dto.categoriaId,
        asientos: dto.asientos,
        cantidad: dto.cantidad ?? 1,
        caracteristicas: dto.caracteristicas || [],
        estado: "ACTIVO",
      },
      include: {
        categoria: true,
      },
    });
    return this.toResponse(created);
  }

  async update(id: string, dto: UpdateVehicleDto) {
    const existing = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Vehiculo no encontrado");

    const updated = await this.prisma.vehiculo.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? existing.nombre,
        categoriaId: dto.categoriaId ?? existing.categoriaId,
        asientos: dto.asientos ?? existing.asientos,
        cantidad: dto.cantidad ?? existing.cantidad,
        caracteristicas: dto.caracteristicas ?? existing.caracteristicas,
      },
      include: {
        categoria: true,
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: "asc" },
        },
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const existing = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Vehiculo no encontrado");
    await this.prisma.vehiculo.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });
    return { message: "Vehiculo desactivado" };
  }

  async getAvailability(params: { fecha?: string }) {
    const { fecha } = params;
    if (!fecha) {
      return { occupiedIds: [] };
    }

    const start = new Date(fecha);
    if (isNaN(start.getTime())) return { occupiedIds: [] };
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [vehiculos, bloqueos, reservasAgrupadas] = await Promise.all([
      this.prisma.vehiculo.findMany({
        where: { estado: "ACTIVO" },
        select: { id: true, cantidad: true },
      }),
      this.prisma.disponibilidadVehiculo.findMany({
        where: {
          fecha: { gte: start, lt: end },
        },
        select: { vehiculoId: true },
      }),
      this.prisma.reserva.groupBy({
        by: ["vehiculoId"],
        where: {
          vehiculoId: { not: null },
          fechaEvento: { gte: start, lt: end },
          estado: { in: ["CONFIRMADA", "PAGO_PARCIAL"] },
        },
        _count: { vehiculoId: true },
      }),
    ]);

    const bloqueadosSet = new Set(bloqueos.map((b) => b.vehiculoId));
    const countByVehiculo = new Map(
      reservasAgrupadas.map((r) => [r.vehiculoId as string, r._count.vehiculoId]),
    );

    const occupiedIds = vehiculos
      .filter((v) => {
        if (bloqueadosSet.has(v.id)) return true;
        const count = countByVehiculo.get(v.id) ?? 0;
        return count >= (v.cantidad ?? 1);
      })
      .map((v) => v.id);

    return { occupiedIds };
  }

  private toResponse(v: any) {
    const imgUrl = v.imagenes?.[0]?.imagen?.url || v.imagenUrl || null;
    return {
      id: v.id,
      name: v.nombre,
      category: v.categoria?.nombre,
      categoriaId: v.categoriaId,
      seats: v.asientos,
      quantity: v.cantidad ?? 1,
      features: v.caracteristicas || [],
      imageUrl: imgUrl,
      estado: v.estado,
    };
  }
}
