import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { EstadoActivo } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateIncluidoDto, UpdateIncluidoDto, IncluidoResponseDto } from './dtos'

@Injectable()
export class IncluidosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los incluidos con filtro de estado
   * Por defecto retorna solo los ACTIVOS para vistas públicas
   */
  async findAll(params: { estado?: EstadoActivo } = {}): Promise<IncluidoResponseDto[]> {
    const estado = params.estado ?? EstadoActivo.ACTIVO
    const incluidos = await this.prisma.incluido.findMany({
      where: { estado },
      include: { categoria: true },
      orderBy: { creadoEn: 'desc' },
    })
    return incluidos.map((i) => this.toResponse(i))
  }

  /**
   * Obtiene todos los incluidos para admin (sin filtro de estado inicialmente)
   */
  async findAllForAdmin(params: { estado?: EstadoActivo } = {}): Promise<IncluidoResponseDto[]> {
    const where = params.estado ? { estado: params.estado } : {}
    const incluidos = await this.prisma.incluido.findMany({
      where,
      include: { 
        categoria: true,
        paquetes: { select: { paqueteId: true } }
      },
      orderBy: { creadoEn: 'desc' },
    })
    return incluidos.map((i) => this.toResponse(i))
  }

  /**
   * Obtiene un incluido por ID
   */
  async findById(id: string): Promise<IncluidoResponseDto> {
    const incluido = await this.prisma.incluido.findUnique({
      where: { id },
      include: { 
        categoria: true,
        paquetes: { select: { paqueteId: true } }
      },
    })
    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${id} no encontrado`)
    }
    return this.toResponse(incluido)
  }

  /**
   * Obtiene incluidos asociados a un paquete específico (solo ACTIVOS)
   */
  async findByPackageId(paqueteId: string): Promise<IncluidoResponseDto[]> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) {
      throw new NotFoundException(`Paquete con ID ${paqueteId} no encontrado`)
    }

    const links = await this.prisma.paqueteIncluido.findMany({
      where: { paqueteId },
      include: {
        incluido: {
          include: { categoria: true },
        },
      },
      orderBy: { incluido: { creadoEn: 'desc' } },
    })

    return links
      .filter((l) => l.incluido.estado === EstadoActivo.ACTIVO && l.incluido.categoria.estado === EstadoActivo.ACTIVO)
      .map((l) => this.toResponse(l.incluido))
  }

  /**
   * Obtiene todos los incluidos de un paquete (sin filtro de estado)
   */
  async findByPackageIdForAdmin(paqueteId: string): Promise<IncluidoResponseDto[]> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) {
      throw new NotFoundException(`Paquete con ID ${paqueteId} no encontrado`)
    }

    const links = await this.prisma.paqueteIncluido.findMany({
      where: { paqueteId },
      include: {
        incluido: {
          include: { categoria: true },
        },
      },
      orderBy: { incluido: { creadoEn: 'desc' } },
    })
    return links.map((l) => this.toResponse(l.incluido))
  }

  /**
   * Obtiene incluidos agrupados por categoría para un paquete específico
   */
  async findByPackageIdGroupedByCategory(paqueteId: string): Promise<{
    [categoriaId: number]: {
      categoria: { id: number; nombre: string }
      incluidos: IncluidoResponseDto[]
    }
  }> {
    const incluidos = await this.findByPackageId(paqueteId)
    
    const grouped: {
      [categoriaId: number]: {
        categoria: { id: number; nombre: string }
        incluidos: IncluidoResponseDto[]
      }
    } = {}

    for (const incluido of incluidos) {
      if (!grouped[incluido.categoriaId]) {
        grouped[incluido.categoriaId] = {
          categoria: {
            id: incluido.categoriaId,
            nombre: incluido.categoriaNombre,
          },
          incluidos: [],
        }
      }
      grouped[incluido.categoriaId].incluidos.push(incluido)
    }

    return grouped
  }

  /**
   * Crea un nuevo incluido
   */
  async create(data: CreateIncluidoDto): Promise<IncluidoResponseDto> {
    // Verificar que la categoría existe y está activa
    const categoria = await this.prisma.categoriaIncluido.findUnique({
      where: { id: data.categoriaId },
    })
    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${data.categoriaId} no encontrada`)
    }
    if (categoria.estado !== EstadoActivo.ACTIVO) {
      throw new BadRequestException('La categoría seleccionada no está activa')
    }

    const created = await this.prisma.incluido.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        categoriaId: data.categoriaId,
        estado: EstadoActivo.ACTIVO,
      },
      include: { categoria: true },
    })
    return this.toResponse(created)
  }

  /**
   * Actualiza un incluido existente
   */
  async update(id: string, data: UpdateIncluidoDto): Promise<IncluidoResponseDto> {
    const incluido = await this.prisma.incluido.findUnique({
      where: { id },
      include: { categoria: true },
    })
    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${id} no encontrado`)
    }

    // Si se cambia la categoría, verificar que existe y está activa
    if (data.categoriaId && data.categoriaId !== incluido.categoriaId) {
      const categoria = await this.prisma.categoriaIncluido.findUnique({
        where: { id: data.categoriaId },
      })
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${data.categoriaId} no encontrada`)
      }
      if (categoria.estado !== EstadoActivo.ACTIVO) {
        throw new BadRequestException('La categoría seleccionada no está activa')
      }
    }

    const updated = await this.prisma.incluido.update({
      where: { id },
      data: {
        nombre: data.nombre ?? incluido.nombre,
        descripcion: data.descripcion !== undefined ? data.descripcion || null : incluido.descripcion,
        categoriaId: data.categoriaId ?? incluido.categoriaId,
        estado: data.estado ?? incluido.estado,
      },
      include: { categoria: true },
    })
    return this.toResponse(updated)
  }

  /**
   * Soft delete: cambia el estado a INACTIVO
   */
  async deactivate(id: string): Promise<IncluidoResponseDto> {
    const incluido = await this.prisma.incluido.findUnique({
      where: { id },
      include: { categoria: true },
    })
    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${id} no encontrado`)
    }

    if (incluido.estado === EstadoActivo.INACTIVO) {
      throw new BadRequestException('El incluido ya está inactivo')
    }

    const updated = await this.prisma.incluido.update({
      where: { id },
      data: { estado: EstadoActivo.INACTIVO },
      include: { categoria: true },
    })
    return this.toResponse(updated)
  }

  /**
   * Reactiva un incluido (cambiar de INACTIVO a ACTIVO)
   */
  async activate(id: string): Promise<IncluidoResponseDto> {
    const incluido = await this.prisma.incluido.findUnique({
      where: { id },
      include: { categoria: true },
    })
    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${id} no encontrado`)
    }

    if (incluido.estado === EstadoActivo.ACTIVO) {
      throw new BadRequestException('El incluido ya está activo')
    }

    const updated = await this.prisma.incluido.update({
      where: { id },
      data: { estado: EstadoActivo.ACTIVO },
      include: { categoria: true },
    })
    return this.toResponse(updated)
  }

  /**
   * Asocia un incluido a un paquete
   */
  async attachToPackage(incluidoId: string, paqueteId: string): Promise<{ ok: boolean }> {
    const [incluido, pkg] = await Promise.all([
      this.prisma.incluido.findUnique({ where: { id: incluidoId } }),
      this.prisma.paquete.findUnique({ where: { id: paqueteId } }),
    ])

    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${incluidoId} no encontrado`)
    }
    if (!pkg) {
      throw new NotFoundException(`Paquete con ID ${paqueteId} no encontrado`)
    }

    await this.prisma.paqueteIncluido.upsert({
      where: { paqueteId_incluidoId: { paqueteId, incluidoId } },
      create: { paqueteId, incluidoId },
      update: {},
    })
    return { ok: true }
  }

  /**
   * Desasocia un incluido de un paquete
   */
  async detachFromPackage(incluidoId: string, paqueteId: string): Promise<{ ok: boolean }> {
    const link = await this.prisma.paqueteIncluido.findUnique({
      where: { paqueteId_incluidoId: { paqueteId, incluidoId } },
    })

    if (!link) {
      throw new NotFoundException(`Vínculo entre paquete y incluido no encontrado`)
    }

    await this.prisma.paqueteIncluido.delete({
      where: { paqueteId_incluidoId: { paqueteId, incluidoId } },
    })
    return { ok: true }
  }

  /**
   * Elimina permanentemente un incluido (hard delete)
   */
  async delete(id: string): Promise<{ ok: true }> {
    const incluido = await this.prisma.incluido.findUnique({
      where: { id },
    })
    if (!incluido) {
      throw new NotFoundException(`Incluido con ID ${id} no encontrado`)
    }

    // Primero, desasociar de todos los paquetes
    await this.prisma.paqueteIncluido.deleteMany({
      where: { incluidoId: id },
    })

    // Luego eliminar el incluido
    await this.prisma.incluido.delete({
      where: { id },
    })

    return { ok: true }
  }

  /**
   * Convierte el modelo de Prisma a DTO de respuesta
   */
  private toResponse(incluido: any): IncluidoResponseDto {
    return {
      id: incluido.id,
      nombre: incluido.nombre,
      descripcion: incluido.descripcion,
      categoriaId: incluido.categoriaId,
      categoriaNombre: incluido.categoria.nombre,
      estado: incluido.estado,
      creadoEn: incluido.creadoEn,
      actualizadoEn: incluido.actualizadoEn,      packageIds: incluido.paquetes?.map((p: any) => p.paqueteId) || undefined,    }
  }
}
