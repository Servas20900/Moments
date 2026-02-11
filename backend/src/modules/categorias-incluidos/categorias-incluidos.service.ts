import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common'
import { EstadoActivo } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import {
  CreateCategoriaIncluidoDto,
  UpdateCategoriaIncluidoDto,
  CategoriaIncluidoResponseDto,
} from './dtos'

@Injectable()
export class CategoriasIncluidosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las categorías de incluidos con filtro de estado
   * Por defecto retorna solo las ACTIVAS
   */
  async findAll(params: { estado?: EstadoActivo } = {}): Promise<CategoriaIncluidoResponseDto[]> {
    const estado = params.estado ?? EstadoActivo.ACTIVO
    const categorias = await this.prisma.categoriaIncluido.findMany({
      where: { estado },
      orderBy: { nombre: 'asc' },
    })
    return categorias.map((c) => this.toResponse(c))
  }

  /**
   * Obtiene todas las categorías para admin (sin filtro de estado por defecto)
   */
  async findAllForAdmin(params: { estado?: EstadoActivo } = {}): Promise<CategoriaIncluidoResponseDto[]> {
    const where = params.estado ? { estado: params.estado } : {}
    const categorias = await this.prisma.categoriaIncluido.findMany({
      where,
      orderBy: { nombre: 'asc' },
    })
    return categorias.map((c) => this.toResponse(c))
  }

  /**
   * Obtiene una categoría por ID
   */
  async findById(id: number): Promise<CategoriaIncluidoResponseDto> {
    const categoria = await this.prisma.categoriaIncluido.findUnique({ where: { id } })
    if (!categoria) {
      throw new NotFoundException(`Categoría de incluido con ID ${id} no encontrada`)
    }
    return this.toResponse(categoria)
  }

  /**
   * Crea una nueva categoría de incluido
   */
  async create(data: CreateCategoriaIncluidoDto): Promise<CategoriaIncluidoResponseDto> {
    // Verificar que no exista una categoría con el mismo nombre
    const existing = await this.prisma.categoriaIncluido.findUnique({
      where: { nombre: data.nombre },
    })
    if (existing) {
      throw new ConflictException(`Ya existe una categoría con el nombre "${data.nombre}"`)
    }

    const created = await this.prisma.categoriaIncluido.create({
      data: {
        nombre: data.nombre,
        estado: EstadoActivo.ACTIVO,
      },
    })
    return this.toResponse(created)
  }

  /**
   * Actualiza una categoría existente
   */
  async update(id: number, data: UpdateCategoriaIncluidoDto): Promise<CategoriaIncluidoResponseDto> {
    const categoria = await this.prisma.categoriaIncluido.findUnique({ where: { id } })
    if (!categoria) {
      throw new NotFoundException(`Categoría de incluido con ID ${id} no encontrada`)
    }

    // Si se cambia el nombre, verificar que no exista otra categoría con ese nombre
    if (data.nombre && data.nombre !== categoria.nombre) {
      const existing = await this.prisma.categoriaIncluido.findUnique({
        where: { nombre: data.nombre },
      })
      if (existing) {
        throw new ConflictException(`Ya existe una categoría con el nombre "${data.nombre}"`)
      }
    }

    const updated = await this.prisma.categoriaIncluido.update({
      where: { id },
      data: {
        nombre: data.nombre ?? categoria.nombre,
        estado: data.estado ?? categoria.estado,
      },
    })
    return this.toResponse(updated)
  }

  /**
   * Desactiva una categoría (soft delete)
   */
  async deactivate(id: number): Promise<CategoriaIncluidoResponseDto> {
    const categoria = await this.prisma.categoriaIncluido.findUnique({ where: { id } })
    if (!categoria) {
      throw new NotFoundException(`Categoría de incluido con ID ${id} no encontrada`)
    }

    if (categoria.estado === EstadoActivo.INACTIVO) {
      throw new BadRequestException('La categoría ya está inactiva')
    }

    const updated = await this.prisma.categoriaIncluido.update({
      where: { id },
      data: { estado: EstadoActivo.INACTIVO },
    })
    return this.toResponse(updated)
  }

  /**
   * Reactiva una categoría
   */
  async activate(id: number): Promise<CategoriaIncluidoResponseDto> {
    const categoria = await this.prisma.categoriaIncluido.findUnique({ where: { id } })
    if (!categoria) {
      throw new NotFoundException(`Categoría de incluido con ID ${id} no encontrada`)
    }

    if (categoria.estado === EstadoActivo.ACTIVO) {
      throw new BadRequestException('La categoría ya está activa')
    }

    const updated = await this.prisma.categoriaIncluido.update({
      where: { id },
      data: { estado: EstadoActivo.ACTIVO },
    })
    return this.toResponse(updated)
  }

  /**
   * Elimina permanentemente una categoría (hard delete)
   */
  async delete(id: number): Promise<{ ok: true }> {
    const categoria = await this.prisma.categoriaIncluido.findUnique({
      where: { id },
      include: { incluidos: true },
    })

    if (!categoria) {
      throw new NotFoundException(`Categoría de incluido con ID ${id} no encontrada`)
    }

    if (categoria.incluidos.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la categoría "${categoria.nombre}" porque tiene ${categoria.incluidos.length} incluido(s) asociado(s)`,
      )
    }

    await this.prisma.categoriaIncluido.delete({
      where: { id },
    })

    return { ok: true }
  }

  /**
   * Convierte el modelo de Prisma a DTO de respuesta
   */
  private toResponse(categoria: any): CategoriaIncluidoResponseDto {
    return {
      id: categoria.id,
      nombre: categoria.nombre,
      estado: categoria.estado,
      creadoEn: categoria.creadoEn,
    }
  }
}
