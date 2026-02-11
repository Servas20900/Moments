import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '../auth/roles.enum'
import { RolesGuard } from '../auth/guards/roles.guard'
import { CategoriasIncluidosService } from './categorias-incluidos.service'
import {
  CreateCategoriaIncluidoDto,
  UpdateCategoriaIncluidoDto,
  CategoriaIncluidoResponseDto,
} from './dtos'

@ApiTags('Categorías de Incluidos')
@Controller('categorias-incluidos')
export class CategoriasIncluidosController {
  constructor(private readonly service: CategoriasIncluidosService) {}

  /**
   * Obtiene todas las categorías de incluidos (públicas, solo ACTIVAS)
   */
  @Get()
  @ApiOperation({ summary: 'Obtiene todas las categorías de incluidos activas (público)' })
  @ApiResponse({ status: 200, description: 'Lista de categorías activas', type: [CategoriaIncluidoResponseDto] })
  async findAll(): Promise<CategoriaIncluidoResponseDto[]> {
    return this.service.findAll({ estado: EstadoActivo.ACTIVO })
  }

  /**
   * Obtiene todas las categorías para admin (con filtro opcional de estado)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtiene todas las categorías de incluidos (admin)' })
  @ApiQuery({ name: 'estado', enum: EstadoActivo, required: false })
  @ApiResponse({ status: 200, description: 'Lista de categorías', type: [CategoriaIncluidoResponseDto] })
  async findAllForAdmin(@Query('estado') estado?: EstadoActivo): Promise<CategoriaIncluidoResponseDto[]> {
    return this.service.findAllForAdmin({ estado })
  }

  /**
   * Obtiene una categoría por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una categoría de incluido por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada', type: CategoriaIncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<CategoriaIncluidoResponseDto> {
    return this.service.findById(id)
  }

  /**
   * Crea una nueva categoría de incluido
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crea una nueva categoría de incluido' })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente', type: CategoriaIncluidoResponseDto })
  @ApiResponse({ status: 409, description: 'Ya existe una categoría con ese nombre' })
  async create(@Body() createDto: CreateCategoriaIncluidoDto): Promise<CategoriaIncluidoResponseDto> {
    return this.service.create(createDto)
  }

  /**
   * Actualiza una categoría existente
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualiza una categoría de incluido' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada exitosamente', type: CategoriaIncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'Ya existe una categoría con ese nombre' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoriaIncluidoDto,
  ): Promise<CategoriaIncluidoResponseDto> {
    return this.service.update(id, updateDto)
  }

  /**
   * Desactiva una categoría (soft delete)
   */
  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactiva una categoría de incluido' })
  @ApiResponse({ status: 200, description: 'Categoría desactivada exitosamente', type: CategoriaIncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<CategoriaIncluidoResponseDto> {
    return this.service.deactivate(id)
  }

  /**
   * Reactiva una categoría
   */
  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactiva una categoría de incluido' })
  @ApiResponse({ status: 200, description: 'Categoría reactivada exitosamente', type: CategoriaIncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<CategoriaIncluidoResponseDto> {
    return this.service.activate(id)
  }

  /**
   * Elimina permanentemente una categoría (hard delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elimina una categoría de incluido permanentemente' })
  @ApiResponse({ status: 200, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  @ApiResponse({ status: 409, description: 'La categoría tiene incluidos asociados' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ ok: true }> {
    return this.service.delete(id)
  }
}
