import { Injectable, NotFoundException } from "@nestjs/common";
import { EstadoActivo } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePackageDto } from "./dtos/create-package.dto";
import { UpdatePackageDto } from "./dtos/update-package.dto";

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.categoriaPaquete.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { id: "asc" },
    });

    // Si no hay categorías, crear la categoría por defecto
    if (categories.length === 0) {
      const defaultCategory = await this.prisma.categoriaPaquete.create({
        data: {
          nombre: "General",
          estado: "ACTIVO",
        },
      });
      return [defaultCategory];
    }

    return categories;
  }

  async create(dto: CreatePackageDto) {
    // Verificar que la categoría existe, si no, usar o crear la categoría por defecto
    let categoria = await this.prisma.categoriaPaquete.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      // Intentar obtener la primera categoría activa
      const categories = await this.prisma.categoriaPaquete.findMany({
        where: { estado: "ACTIVO" },
        orderBy: { id: "asc" },
        take: 1,
      });

      if (categories.length === 0) {
        // Si no existe ninguna categoría, crear una por defecto
        categoria = await this.prisma.categoriaPaquete.create({
          data: {
            nombre: "General",
            estado: "ACTIVO",
          },
        });
      } else {
        categoria = categories[0];
      }
    }

    const created = await this.prisma.paquete.create({
      data: {
        categoriaId: categoria.id,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precioBase: dto.precioBase,
        maxPersonas: dto.maxPersonas,
        estado: "ACTIVO",
      },
      include: {
        categoria: true,
        vehiculos: { include: { vehiculo: true } },
      },
    });

    if (dto.vehicleIds?.length) {
      await this.prisma.paqueteVehiculo.createMany({
        data: dto.vehicleIds.map((vehiculoId) => ({ paqueteId: created.id, vehiculoId })),
        skipDuplicates: true,
      });
    }

    // reload with vehicles after linking
    const reloaded = await this.prisma.paquete.findUnique({
      where: { id: created.id },
      include: { categoria: true, vehiculos: { include: { vehiculo: true } } },
    });

    return this.toResponse(reloaded);
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

    const [packages, total] = await Promise.all([
      this.prisma.paquete.findMany({
        where,
        skip,
        take,
        include: {
          categoria: true,
          vehiculos: { include: { vehiculo: true } },
          imagenes: {
            include: { imagen: true },
            orderBy: { orden: "asc" },
            take: 1,
          },
        },
        orderBy: { creadoEn: "desc" },
      }),
      this.prisma.paquete.count({ where }),
    ]);

    return { data: packages.map((p) => this.toResponse(p)), total, skip, take };
  }

  async findById(id: string) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
      include: {
        categoria: true,
        vehiculos: { include: { vehiculo: true } },
        reservas: { take: 5 },
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: "asc" },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException("Package not found");
    }

    return this.toResponse(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException("Package not found");
    }

    if (dto.vehicleIds) {
      await this.prisma.paqueteVehiculo.deleteMany({ where: { paqueteId: id } });
      if (dto.vehicleIds.length) {
        await this.prisma.paqueteVehiculo.createMany({
          data: dto.vehicleIds.map((vehiculoId) => ({ paqueteId: id, vehiculoId })),
          skipDuplicates: true,
        });
      }
    }

    const updated = await this.prisma.paquete.update({
      where: { id },
      data: {
        categoriaId: dto.categoriaId || pkg.categoriaId,
        nombre: dto.nombre || pkg.nombre,
        descripcion: dto.descripcion || pkg.descripcion,
        precioBase: dto.precioBase || pkg.precioBase,
        maxPersonas: dto.maxPersonas || pkg.maxPersonas,
      },
      include: {
        categoria: true,
        vehiculos: { include: { vehiculo: true } },
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException("Package not found");
    }

    await this.prisma.paquete.update({
      where: { id },
      data: { estado: "INACTIVO" },
    });

    return { message: "Package deactivated successfully" };
  }

  private toResponse(pkg: any) {
    const imgUrl = pkg.imagenes?.[0]?.imagen?.url || pkg.imagenUrl || null;
    const vehicles = pkg.vehiculos?.map((v: any) => ({
      id: v.vehiculo?.id,
      name: v.vehiculo?.nombre,
      seats: v.vehiculo?.asientos,
      category: v.vehiculo?.categoria,
      rate: v.vehiculo ? Number(v.vehiculo.tarifaPorHora) : undefined,
    })) || [];
    return {
      id: pkg.id,
      name: pkg.nombre,
      category: pkg.categoria?.nombre || "",
      description: pkg.descripcion,
      price: Number(pkg.precioBase),
      maxPeople: pkg.maxPersonas,
      vehicle: vehicles[0]?.name ?? "N/A",
      vehicles,
      imageUrl: imgUrl,
      estado: pkg.estado,
      creadoEn: pkg.creadoEn,
    };
  }
}
