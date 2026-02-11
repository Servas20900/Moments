import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { CategoriaExtra, EstadoActivo } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateExtraDto, UpdateExtraDto, ExtraResponseDto } from './dtos'

@Injectable()
export class ExtrasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los extras con filtro de estado
   * Por defecto retorna solo los ACTIVOS para vistas públicas
   */
  async findAll(params: { estado?: EstadoActivo } = {}): Promise<ExtraResponseDto[]> {
    const estado = params.estado ?? EstadoActivo.ACTIVO
    const extras = await this.prisma.extra.findMany({
      where: { estado },
      orderBy: { creadoEn: 'desc' },
    })
    return extras.map((e) => this.toResponse(e))
  }

  /**
   * Obtiene todos los extras para admin (sin filtro de estado inicialmente)
   */
  async findAllForAdmin(params: { estado?: EstadoActivo } = {}): Promise<ExtraResponseDto[]> {
    const where = params.estado ? { estado: params.estado } : {}
    const extras = await this.prisma.extra.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    })
    return extras.map((e) => this.toResponse(e))
  }

  /**
   * Obtiene un extra por ID
   */
  async findById(id: string): Promise<ExtraResponseDto> {
    const extra = await this.prisma.extra.findUnique({ where: { id } })
    if (!extra) {
      throw new NotFoundException(`Extra with ID ${id} not found`)
    }
    return this.toResponse(extra)
  }

  /**
   * Obtiene extras asociados a un paquete específico (solo ACTIVOS)
   */
  async findByPackageId(paqueteId: string): Promise<ExtraResponseDto[]> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${paqueteId} not found`)
    }

    const links = await this.prisma.paqueteExtra.findMany({
      where: { paqueteId },
      include: { extra: true },
      orderBy: { extra: { creadoEn: 'desc' } },
    })
    return links
      .filter((l) => l.extra.estado === EstadoActivo.ACTIVO)
      .map((l) => this.toResponse(l.extra))
  }

  /**
   * Obtiene todos los extras de un paquete (sin filtro de estado)
   */
  async findByPackageIdForAdmin(paqueteId: string): Promise<ExtraResponseDto[]> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${paqueteId} not found`)
    }

    const links = await this.prisma.paqueteExtra.findMany({
      where: { paqueteId },
      include: { extra: true },
      orderBy: { extra: { creadoEn: 'desc' } },
    })
    return links.map((l) => this.toResponse(l.extra))
  }

  /**
   * Crea un nuevo extra
   */
  async create(data: CreateExtraDto): Promise<ExtraResponseDto> {
    const created = await this.prisma.extra.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        categoria: data.categoria || CategoriaExtra.SIN_ALCOHOL,
        estado: EstadoActivo.ACTIVO,
      },
    })
    return this.toResponse(created)
  }

  /**
   * Actualiza un extra existente
   */
  async update(id: string, data: UpdateExtraDto): Promise<ExtraResponseDto> {
    const extra = await this.prisma.extra.findUnique({ where: { id } })
    if (!extra) {
      throw new NotFoundException(`Extra with ID ${id} not found`)
    }

    const updated = await this.prisma.extra.update({
      where: { id },
      data: {
        nombre: data.nombre ?? extra.nombre,
        descripcion: data.descripcion !== undefined ? data.descripcion || null : extra.descripcion,
        precio: data.precio ?? extra.precio,
        categoria: data.categoria ?? extra.categoria,
      },
    })
    return this.toResponse(updated)
  }

  /**
   * Soft delete: cambia el estado a INACTIVO
   */
  async deactivate(id: string): Promise<ExtraResponseDto> {
    const extra = await this.prisma.extra.findUnique({ where: { id } })
    if (!extra) {
      throw new NotFoundException(`Extra with ID ${id} not found`)
    }

    if (extra.estado === EstadoActivo.INACTIVO) {
      throw new BadRequestException('Extra is already inactive')
    }

    const updated = await this.prisma.extra.update({
      where: { id },
      data: { estado: EstadoActivo.INACTIVO },
    })
    return this.toResponse(updated)
  }

  /**
   * Reactiva un extra (cambiar de INACTIVO a ACTIVO)
   */
  async activate(id: string): Promise<ExtraResponseDto> {
    const extra = await this.prisma.extra.findUnique({ where: { id } })
    if (!extra) {
      throw new NotFoundException(`Extra with ID ${id} not found`)
    }

    if (extra.estado === EstadoActivo.ACTIVO) {
      throw new BadRequestException('Extra is already active')
    }

    const updated = await this.prisma.extra.update({
      where: { id },
      data: { estado: EstadoActivo.ACTIVO },
    })
    return this.toResponse(updated)
  }

  /**
   * Asocia un extra a un paquete
   */
  async attachToPackage(extraId: string, paqueteId: string): Promise<{ ok: boolean }> {
    const [extra, pkg] = await Promise.all([
      this.prisma.extra.findUnique({ where: { id: extraId } }),
      this.prisma.paquete.findUnique({ where: { id: paqueteId } }),
    ])

    if (!extra) {
      throw new NotFoundException(`Extra with ID ${extraId} not found`)
    }
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${paqueteId} not found`)
    }

    await this.prisma.paqueteExtra.upsert({
      where: { paqueteId_extraId: { paqueteId, extraId } },
      create: { paqueteId, extraId },
      update: {},
    })
    return { ok: true }
  }

  /**
   * Desasocia un extra de un paquete
   */
  async detachFromPackage(extraId: string, paqueteId: string): Promise<{ ok: boolean }> {
    const link = await this.prisma.paqueteExtra.findUnique({
      where: { paqueteId_extraId: { paqueteId, extraId } },
    })

    if (!link) {
      throw new NotFoundException('Extra is not associated with this package')
    }

    await this.prisma.paqueteExtra.delete({
      where: { paqueteId_extraId: { paqueteId, extraId } },
    })
    return { ok: true }
  }

  /**
   * Obtiene todos los extras asociados a un paquete o a los que pertenecen
   */
  async getExtrasForPackageAssociation(paqueteId: string): Promise<{
    associated: ExtraResponseDto[]
    available: ExtraResponseDto[]
  }> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${paqueteId} not found`)
    }

    // Obtener todos los extras activos
    const allExtras = await this.prisma.extra.findMany({
      where: { estado: EstadoActivo.ACTIVO },
      orderBy: { creadoEn: 'desc' },
    })

    // Obtener los ya asociados
    const links = await this.prisma.paqueteExtra.findMany({
      where: { paqueteId },
      include: { extra: true },
    })

    const associatedIds = new Set(links.map((l) => l.extra.id))

    return {
      associated: links.map((l) => this.toResponse(l.extra)),
      available: allExtras.filter((e) => !associatedIds.has(e.id)).map((e) => this.toResponse(e)),
    }
  }

  /**
   * Transforma un Extra de Prisma a ExtraResponseDto
   */
  private toResponse(e: any): ExtraResponseDto {
    return {
      id: e.id,
      nombre: e.nombre,
      descripcion: e.descripcion,
      precio: Number(e.precio),
      categoria: e.categoria,
      estado: e.estado,
      creadoEn: e.creadoEn,
      actualizadoEn: e.actualizadoEn,
    }
  }
}
