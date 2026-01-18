import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePackageDto) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaPaquete.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Category not found');
    }

    const created = await this.prisma.paquete.create({
      data: {
        categoriaId: dto.categoriaId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precioBase: dto.precioBase,
        maxPersonas: dto.maxPersonas,
        estado: 'ACTIVO',
      },
      include: {
        categoria: true,
      },
    });
    return this.toResponse(created);
  }

  async findAll(skip = 0, take = 10) {
    const [packages, total] = await Promise.all([
      this.prisma.paquete.findMany({
        where: { estado: 'ACTIVO' },
        skip,
        take,
        include: {
          categoria: true,
          imagenes: {
            include: { imagen: true },
            orderBy: { orden: 'asc' },
            take: 1,
          },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.paquete.count({ where: { estado: 'ACTIVO' } }),
    ]);

    return { data: packages.map((p) => this.toResponse(p)), total, skip, take };
  }

  async findById(id: string) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
      include: {
        categoria: true,
        reservas: { take: 5 },
        imagenes: {
          include: { imagen: true },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return this.toResponse(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
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
      },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    const pkg = await this.prisma.paquete.findUnique({
      where: { id },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    await this.prisma.paquete.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'Package deactivated successfully' };
  }

  private toResponse(pkg: any) {
    const imgUrl = pkg.imagenes?.[0]?.imagen?.url || pkg.imagenUrl || null;
    return {
      id: pkg.id,
      name: pkg.nombre,
      category: pkg.categoria?.nombre || '',
      description: pkg.descripcion,
      price: Number(pkg.precioBase),
      maxPeople: pkg.maxPersonas,
      vehicle: 'N/A',
      imageUrl: imgUrl,
      estado: pkg.estado,
      creadoEn: pkg.creadoEn,
    };
  }
}
