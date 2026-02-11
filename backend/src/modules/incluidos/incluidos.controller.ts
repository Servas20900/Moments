import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { EstadoActivo } from '@prisma/client'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '../auth/roles.enum'
import { RolesGuard } from '../auth/guards/roles.guard'
import { IncluidosService } from './incluidos.service'
import { CreateIncluidoDto, UpdateIncluidoDto, IncluidoResponseDto } from './dtos'

@ApiTags('Incluidos (Bebidas)')
@Controller('incluidos')
export class IncluidosController {
  constructor(private readonly service: IncluidosService) {}

  /**
   * Obtiene todos los incluidos (públicos, solo ACTIVOS)
   */
  @Get()
  @ApiOperation({ summary: 'Obtiene todos los incluidos activos (público)' })
  @ApiResponse({ status: 200, description: 'Lista de incluidos activos', type: [IncluidoResponseDto] })
  async findAll(): Promise<IncluidoResponseDto[]> {
    return this.service.findAll({ estado: EstadoActivo.ACTIVO })
  }

  /**
   * Obtiene todos los incluidos para admin (con filtro opcional de estado)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtiene todos los incluidos (admin)' })
  @ApiQuery({ name: 'estado', enum: EstadoActivo, required: false })
  @ApiResponse({ status: 200, description: 'Lista de incluidos', type: [IncluidoResponseDto] })
  async findAllForAdmin(@Query('estado') estado?: EstadoActivo): Promise<IncluidoResponseDto[]> {
    return this.service.findAllForAdmin({ estado })
  }

  /**
   * Obtiene incluidos de un paquete (público)
   */
  @Get('package/:paqueteId')
  @ApiOperation({ summary: 'Obtiene incluidos activos de un paquete específico' })
  @ApiResponse({ status: 200, description: 'Lista de incluidos del paquete', type: [IncluidoResponseDto] })
  @ApiResponse({ status: 404, description: 'Paquete no encontrado' })
  async findByPackageId(@Param('paqueteId') paqueteId: string): Promise<IncluidoResponseDto[]> {
    return this.service.findByPackageId(paqueteId)
  }

  /**
   * Obtiene incluidos de un paquete agrupados por categoría (público)
   */
  @Get('package/:paqueteId/grouped')
  @ApiOperation({ summary: 'Obtiene incluidos activos de un paquete agrupados por categoría' })
  @ApiResponse({ status: 200, description: 'Incluidos agrupados por categoría' })
  @ApiResponse({ status: 404, description: 'Paquete no encontrado' })
  async findByPackageIdGrouped(@Param('paqueteId') paqueteId: string) {
    return this.service.findByPackageIdGroupedByCategory(paqueteId)
  }

  /**
   * Obtiene incluidos de un paquete (admin)
   */
  @Get('admin/package/:paqueteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtiene todos los incluidos de un paquete (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de incluidos del paquete', type: [IncluidoResponseDto] })
  @ApiResponse({ status: 404, description: 'Paquete no encontrado' })
  async findByPackageIdForAdmin(@Param('paqueteId') paqueteId: string): Promise<IncluidoResponseDto[]> {
    return this.service.findByPackageIdForAdmin(paqueteId)
  }

  /**
   * Obtiene un incluido por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtiene un incluido por ID' })
  @ApiResponse({ status: 200, description: 'Incluido encontrado', type: IncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Incluido no encontrado' })
  async findById(@Param('id') id: string): Promise<IncluidoResponseDto> {
    return this.service.findById(id)
  }

  /**
   * Crea un nuevo incluido
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crea un nuevo incluido' })
  @ApiResponse({ status: 201, description: 'Incluido creado exitosamente', type: IncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  async create(@Body() createDto: CreateIncluidoDto): Promise<IncluidoResponseDto> {
    return this.service.create(createDto)
  }

  /**
   * Actualiza un incluido existente
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualiza un incluido' })
  @ApiResponse({ status: 200, description: 'Incluido actualizado exitosamente', type: IncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Incluido no encontrado' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateIncluidoDto): Promise<IncluidoResponseDto> {
    return this.service.update(id, updateDto)
  }

  /**
   * Desactiva un incluido (soft delete)
   */
  @Put(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactiva un incluido' })
  @ApiResponse({ status: 200, description: 'Incluido desactivado exitosamente', type: IncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Incluido no encontrado' })
  async deactivate(@Param('id') id: string): Promise<IncluidoResponseDto> {
    return this.service.deactivate(id)
  }

  /**
   * Reactiva un incluido
   */
  @Put(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reactiva un incluido' })
  @ApiResponse({ status: 200, description: 'Incluido reactivado exitosamente', type: IncluidoResponseDto })
  @ApiResponse({ status: 404, description: 'Incluido no encontrado' })
  async activate(@Param('id') id: string): Promise<IncluidoResponseDto> {
    return this.service.activate(id)
  }

  /**
   * Elimina permanentemente un incluido (hard delete)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Elimina un incluido permanentemente' })
  @ApiResponse({ status: 200, description: 'Incluido eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Incluido no encontrado' })
  async delete(@Param('id') id: string): Promise<{ ok: true }> {
    return this.service.delete(id)
  }

  /**
   * Asociar un incluido a un paquete
   */
  @Post('attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asociar un incluido a un paquete' })
  async attachToPackage(@Body() body: { incluidoId: string; paqueteId: string }) {
    if (!body.incluidoId || !body.paqueteId) {
      throw new BadRequestException('incluidoId and paqueteId are required')
    }
    return this.service.attachToPackage(body.incluidoId, body.paqueteId)
  }

  /**
   * Desasociar un incluido de un paquete
   */
  @Delete(':incluidoId/packages/:paqueteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Desasociar un incluido de un paquete' })
  async detachFromPackage(@Param('incluidoId') incluidoId: string, @Param('paqueteId') paqueteId: string) {
    return this.service.detachFromPackage(incluidoId, paqueteId)
  }
}
