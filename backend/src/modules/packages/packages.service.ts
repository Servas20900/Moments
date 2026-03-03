import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EstadoActivo } from "@prisma/client";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePackageDto } from "./dtos/create-package.dto";
import { UpdatePackageDto } from "./dtos/update-package.dto";

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    const categories = await this.prisma.categoriaPaquete.findMany({
      where: { estado: "ACTIVO" },
      orderBy: { nombre: "asc" },
    });

    return categories.map((category) => ({
      id: category.id,
      nombre: category.nombre,
      estado: category.estado,
    }));
  }

  async createCategory(nombre: string) {
    const normalized = (nombre ?? "").trim();
    if (!normalized) {
      throw new BadRequestException("Category name is required");
    }

    const existing = await this.prisma.categoriaPaquete.findFirst({
      where: { nombre: { equals: normalized, mode: "insensitive" } },
    });

    if (existing) {
      throw new BadRequestException("Category already exists");
    }

    return this.prisma.categoriaPaquete.create({
      data: { nombre: normalized, estado: "ACTIVO" },
      select: { id: true, nombre: true, estado: true },
    });
  }

  async updateCategory(id: number, nombre: string) {
    const normalized = (nombre ?? "").trim();
    if (!normalized) {
      throw new BadRequestException("Category name is required");
    }

    const category = await this.prisma.categoriaPaquete.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const duplicate = await this.prisma.categoriaPaquete.findFirst({
      where: {
        nombre: { equals: normalized, mode: "insensitive" },
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new BadRequestException("Category already exists");
    }

    return this.prisma.categoriaPaquete.update({
      where: { id },
      data: { nombre: normalized },
      select: { id: true, nombre: true, estado: true },
    });
  }

  async deleteCategory(id: number, fallbackCategoryId: number) {
    const category = await this.prisma.categoriaPaquete.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (!Number.isFinite(fallbackCategoryId) || fallbackCategoryId <= 0) {
      throw new BadRequestException("Fallback category is required");
    }

    if (fallbackCategoryId === id) {
      throw new BadRequestException("Fallback category cannot be the same category");
    }

    const fallback = await this.prisma.categoriaPaquete.findUnique({ where: { id: fallbackCategoryId } });
    if (!fallback) {
      throw new NotFoundException("Fallback category not found");
    }

    await this.prisma.$transaction([
      this.prisma.paquete.updateMany({
        where: { categoriaId: id },
        data: { categoriaId: fallbackCategoryId },
      }),
      this.prisma.categoriaPaquete.update({
        where: { id },
        data: { estado: "INACTIVO" },
      }),
    ]);

    return { message: "Category deleted successfully" };
  }

  async create(dto: CreatePackageDto) {
    const normalizedVehicleIds = this.normalizeVehicleIds(dto.vehicleIds);
    const normalizedIncluidos = this.normalizeIncluidos(dto.incluidos);
    if (normalizedVehicleIds.length === 0) {
      throw new BadRequestException("Debes asignar al menos un vehículo al paquete");
    }
    await this.validateActiveVehicles(normalizedVehicleIds);

    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaPaquete.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException("Category not found");
    }

    const created = await this.prisma.paquete.create({
      data: {
        categoriaId: dto.categoriaId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precioBase: dto.precioBase,
        maxPersonas: dto.maxPersonas,
        incluidos: normalizedIncluidos,
        estado: "ACTIVO",
      },
      include: {
        categoria: true,
        vehiculos: { include: { vehiculo: true } },
      },
    });

    if (normalizedVehicleIds.length) {
      await this.prisma.paqueteVehiculo.createMany({
        data: normalizedVehicleIds.map((vehiculoId) => ({ paqueteId: created.id, vehiculoId })),
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
      const normalizedVehicleIds = this.normalizeVehicleIds(dto.vehicleIds);
      if (normalizedVehicleIds.length === 0) {
        throw new BadRequestException("Debes asignar al menos un vehículo al paquete");
      }
      await this.validateActiveVehicles(normalizedVehicleIds);

      await this.prisma.paqueteVehiculo.deleteMany({ where: { paqueteId: id } });
      if (normalizedVehicleIds.length) {
        await this.prisma.paqueteVehiculo.createMany({
          data: normalizedVehicleIds.map((vehiculoId) => ({ paqueteId: id, vehiculoId })),
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
        ...(dto.incluidos !== undefined ? { incluidos: this.normalizeIncluidos(dto.incluidos) } : {}),
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

  private normalizeVehicleIds(vehicleIds?: string[]) {
    if (!Array.isArray(vehicleIds)) return [];
    return Array.from(new Set(vehicleIds.map((id) => (id ?? "").trim()).filter(Boolean)));
  }

  private async validateActiveVehicles(vehicleIds: string[]) {
    if (!vehicleIds.length) return;

    const existing = await this.prisma.vehiculo.findMany({
      where: {
        id: { in: vehicleIds },
        estado: "ACTIVO",
      },
      select: { id: true },
    });

    if (existing.length !== vehicleIds.length) {
      throw new BadRequestException("Uno o más vehículos no existen o están inactivos");
    }
  }

  private normalizeIncluidos(incluidos?: string[]) {
    if (!Array.isArray(incluidos)) return [];
    return incluidos
      .map((item) => (item ?? "").trim())
      .filter(Boolean);
  }

  private toResponse(pkg: any) {
    const imgUrl = pkg.imagenes?.[0]?.imagen?.url || pkg.imagenUrl || null;
    const vehicles = pkg.vehiculos?.map((v: any) => ({
      id: v.vehiculo?.id,
      name: v.vehiculo?.nombre,
      seats: v.vehiculo?.asientos,
      category: v.vehiculo?.categoria,
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
      incluidos: Array.isArray(pkg.incluidos) ? pkg.incluidos : [],
      incluye: Array.isArray(pkg.incluidos) ? pkg.incluidos : [],
      estado: pkg.estado,
      creadoEn: pkg.creadoEn,
    };
  }
}
