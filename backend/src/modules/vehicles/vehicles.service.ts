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

  async findAll(params: { skip?: number; take?: number; categoria?: string; estado?: string }) {
    const { skip = 0, take = 10, categoria, estado = "ACTIVO" } = params;

    const normalizedEstado = Object.values(EstadoActivo).includes(estado as EstadoActivo)
      ? (estado as EstadoActivo)
      : EstadoActivo.ACTIVO;

    const where = {
      estado: normalizedEstado,
      ...(categoria ? { categoria } : {}),
    } as const;

    const [items, total] = await Promise.all([
      this.prisma.vehiculo.findMany({
        where,
        skip,
        take,
        include: {
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
        categoria: dto.categoria,
        asientos: dto.asientos,
        tarifaPorHora: dto.tarifaPorHora,
        estado: "ACTIVO",
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
        categoria: dto.categoria ?? existing.categoria,
        asientos: dto.asientos ?? existing.asientos,
        tarifaPorHora: dto.tarifaPorHora ?? existing.tarifaPorHora,
      },
      include: {
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

  async getAvailability(params: { fecha?: string; horaInicio?: string; horaFin?: string }) {
    const { fecha, horaInicio, horaFin } = params;
    const start = this.parseDateTime(fecha, horaInicio, false);
    const end = this.parseDateTime(fecha, horaFin, true);

    if (!start || !end) {
      return { occupiedIds: [] };
    }

    const reservations = await this.prisma.reserva.findMany({
      where: {
        estado: { in: ["PAGO_PENDIENTE", "CONFIRMADA", "COMPLETADA"] },
        horaInicio: { lt: end },
        horaFin: { gt: start },
      },
      select: { vehiculoId: true },
    });

    const occupiedIds = Array.from(new Set(reservations.map((r) => r.vehiculoId)));
    return { occupiedIds };
  }

  private parseDateTime(fecha?: string, hora?: string, isEnd = false) {
    if (hora && hora.includes("T")) {
      const dt = new Date(hora);
      return isNaN(dt.getTime()) ? null : dt;
    }

    if (fecha && hora) {
      const dt = new Date(`${fecha}T${hora}`);
      return isNaN(dt.getTime()) ? null : dt;
    }

    if (fecha && !hora) {
      const dt = new Date(`${fecha}T${isEnd ? "23:59:59" : "00:00:00"}`);
      return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
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
