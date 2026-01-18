import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CategoriaImagen, EstadoActivo, Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateImageDto } from './dtos/create-image.dto';
import { UpdateImageDto } from './dtos/update-image.dto';
import { AttachImageToPackageDto } from './dtos/attach-image-to-package.dto';
import { AttachImageToVehicleDto } from './dtos/attach-image-to-vehicle.dto';
import { AttachImageToEventDto } from './dtos/attach-image-to-event.dto';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import type { Multer } from 'multer';

@Injectable()
export class ImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      // Do not throw on boot; allow app to run without Cloudinary uploads
      // Upload endpoint will validate config presence at call-time
      // eslint-disable-next-line no-console
      console.warn('[ImagesService] CLOUDINARY_* env vars are not fully set. Uploads will fail until configured.');
    } else {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    }
  }

  async uploadBuffer(file: Multer.File, folder?: string): Promise<{ url: string; response: UploadApiResponse }> {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary no está configurado en el servidor');
    }

    const targetFolder = folder || this.config.get<string>('CLOUDINARY_FOLDER') || 'moments';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: targetFolder, resource_type: 'auto' },
        (err, result) => {
          if (err || !result) return reject(new BadRequestException(err?.message || 'Error al subir a Cloudinary'));
          resolve({ url: result.secure_url, response: result });
        },
      );
      stream.end(file.buffer);
    });
  }

  async create(dto: CreateImageDto) {
    const created = await this.prisma.imagen.create({
      data: {
        categoria: dto.categoria,
        url: dto.url,
        altText: dto.altText,
      },
    });

    return this.toImageResponse(created);
  }

  async findAll(params: {
    categoria?: CategoriaImagen;
    estado?: EstadoActivo;
    skip?: number;
    take?: number;
  }) {
    const { categoria, estado, skip = 0, take = 20 } = params;

    const where: Prisma.ImagenWhereInput = {};
    if (categoria) where.categoria = categoria;
    if (estado) where.estado = estado;

    const [items, total] = await Promise.all([
      this.prisma.imagen.findMany({
        where,
        skip,
        take,
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.imagen.count({ where }),
    ]);

    return {
      data: items.map((img) => this.toImageResponse(img)),
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const imagen = await this.prisma.imagen.findUnique({
      where: { id },
      include: {
        paquetes: {
          include: { paquete: { select: { id: true, nombre: true } } },
          orderBy: { orden: 'asc' },
        },
        vehiculos: {
          include: { vehiculo: { select: { id: true, nombre: true } } },
          orderBy: { orden: 'asc' },
        },
        eventos: {
          include: {
            evento: { select: { id: true, titulo: true, fecha: true } },
          },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!imagen) {
      throw new NotFoundException('Imagen no encontrada');
    }

    return this.toImageWithRelations(imagen);
  }

  async update(id: string, dto: UpdateImageDto) {
    await this.ensureImageExists(id);

    const updated = await this.prisma.imagen.update({
      where: { id },
      data: {
        altText: dto.altText ?? undefined,
        estado: dto.estado ?? undefined,
        categoria: dto.categoria ?? undefined,
      },
    });

    return this.toImageResponse(updated);
  }

  async deactivate(id: string) {
    await this.ensureImageExists(id);

    await this.prisma.imagen.update({
      where: { id },
      data: { estado: EstadoActivo.INACTIVO },
    });

    return { message: 'Imagen desactivada correctamente' };
  }

  async attachToPackage(imagenId: string, dto: AttachImageToPackageDto) {
    await this.ensureImageExists(imagenId);
    await this.ensurePackageExists(dto.paqueteId);

    const rel = await this.prisma.imagenPaquete.upsert({
      where: {
        imagenId_paqueteId: {
          imagenId,
          paqueteId: dto.paqueteId,
        },
      },
      update: { orden: dto.orden ?? 0 },
      create: {
        imagenId,
        paqueteId: dto.paqueteId,
        orden: dto.orden ?? 0,
      },
      include: { paquete: { select: { id: true, nombre: true } } },
    });

    return {
      imagenId: rel.imagenId,
      paquete: rel.paquete,
      orden: rel.orden,
    };
  }

  async attachToVehicle(imagenId: string, dto: AttachImageToVehicleDto) {
    await this.ensureImageExists(imagenId);
    await this.ensureVehicleExists(dto.vehiculoId);

    const rel = await this.prisma.imagenVehiculo.upsert({
      where: {
        imagenId_vehiculoId: {
          imagenId,
          vehiculoId: dto.vehiculoId,
        },
      },
      update: { orden: dto.orden ?? 0 },
      create: {
        imagenId,
        vehiculoId: dto.vehiculoId,
        orden: dto.orden ?? 0,
      },
      include: { vehiculo: { select: { id: true, nombre: true } } },
    });

    return {
      imagenId: rel.imagenId,
      vehiculo: rel.vehiculo,
      orden: rel.orden,
    };
  }

  async attachToEvent(imagenId: string, dto: AttachImageToEventDto) {
    await this.ensureImageExists(imagenId);
    await this.ensureEventExists(dto.eventoId);

    const rel = await this.prisma.imagenEvento.upsert({
      where: {
        imagenId_eventoId: {
          imagenId,
          eventoId: dto.eventoId,
        },
      },
      update: { orden: dto.orden ?? 0 },
      create: {
        imagenId,
        eventoId: dto.eventoId,
        orden: dto.orden ?? 0,
      },
      include: {
        evento: { select: { id: true, titulo: true, fecha: true } },
      },
    });

    return {
      imagenId: rel.imagenId,
      evento: rel.evento,
      orden: rel.orden,
    };
  }

  private async ensureImageExists(id: string) {
    const exists = await this.prisma.imagen.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Imagen no encontrada');
  }

  private async ensurePackageExists(id: string) {
    const exists = await this.prisma.paquete.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Paquete no encontrado');
  }

  private async ensureVehicleExists(id: string) {
    const exists = await this.prisma.vehiculo.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Vehículo no encontrado');
  }

  private async ensureEventExists(id: string) {
    const exists = await this.prisma.eventoCalendario.findUnique({
      where: { id },
    });
    if (!exists) throw new NotFoundException('Evento no encontrado');
  }

  private toImageResponse(img: any) {
    return {
      id: img.id,
      categoria: img.categoria,
      url: img.url,
      altText: img.altText,
      estado: img.estado,
      creadoEn: img.creadoEn,
      actualizadoEn: img.actualizadoEn,
    };
  }

  private toImageWithRelations(img: any) {
    return {
      ...this.toImageResponse(img),
      paquetes: (img.paquetes || []).map((p: any) => ({
        paqueteId: p.paqueteId,
        orden: p.orden,
        paquete: p.paquete,
      })),
      vehiculos: (img.vehiculos || []).map((v: any) => ({
        vehiculoId: v.vehiculoId,
        orden: v.orden,
        vehiculo: v.vehiculo,
      })),
      eventos: (img.eventos || []).map((e: any) => ({
        eventoId: e.eventoId,
        orden: e.orden,
        evento: e.evento,
      })),
    };
  }
}
