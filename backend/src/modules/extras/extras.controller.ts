import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { ExtrasService } from './extras.service'
import { CreateExtraDto, UpdateExtraDto, ExtraResponseDto } from './dtos'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { Role } from '../auth/roles.enum'

@ApiTags('Extras')
@Controller('extras')
export class ExtrasController {
  constructor(private extrasService: ExtrasService) {}

  /**
   * Listar todos los extras activos (público)
   */
  @Get()
  @ApiOperation({ summary: 'Listar extras activos' })
  @ApiResponse({ status: 200, description: 'Lista de extras activos', type: [ExtraResponseDto] })
  async findAll(): Promise<ExtraResponseDto[]> {
    return this.extrasService.findAll()
  }

  /**
   * Listar todos los extras para admin
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Listar todos los extras (admin)' })
  @ApiResponse({ status: 200, description: 'Lista de todos los extras', type: [ExtraResponseDto] })
  async findAllForAdmin(): Promise<ExtraResponseDto[]> {
    return this.extrasService.findAllForAdmin()
  }

  /**
   * Obtener un extra por ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un extra por ID' })
  @ApiResponse({ status: 200, description: 'Extra encontrado', type: ExtraResponseDto })
  async findById(@Param('id') id: string): Promise<ExtraResponseDto> {
    return this.extrasService.findById(id)
  }

  /**
   * Listar extras asociados a un paquete (operación pública - solo activos)
   */
  @Get('paquetes/:id')
  @ApiOperation({ summary: 'Listar extras activos asociados a un paquete' })
  @ApiResponse({ status: 200, description: 'Lista de extras del paquete', type: [ExtraResponseDto] })
  async findByPackage(@Param('id') paqueteId: string): Promise<ExtraResponseDto[]> {
    return this.extrasService.findByPackageId(paqueteId)
  }

  /**
   * Obtener extras disponibles y asociados para un paquete (admin)
   */
  @Get('admin/packages/:paqueteId/association')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Obtener extras disponibles para asociar a un paquete' })
  async getExtrasForAssociation(@Param('paqueteId') paqueteId: string) {
    return this.extrasService.getExtrasForPackageAssociation(paqueteId)
  }

  /**
   * Crear un nuevo extra
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Crear un nuevo extra' })
  @ApiResponse({ status: 201, description: 'Extra creado', type: ExtraResponseDto })
  async create(@Body() createExtraDto: CreateExtraDto): Promise<ExtraResponseDto> {
    if (!createExtraDto.nombre || !createExtraDto.precio) {
      throw new BadRequestException('nombre and precio are required')
    }
    return this.extrasService.create(createExtraDto)
  }

  /**
   * Actualizar un extra
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Actualizar un extra' })
  @ApiResponse({ status: 200, description: 'Extra actualizado', type: ExtraResponseDto })
  async update(@Param('id') id: string, @Body() updateExtraDto: UpdateExtraDto): Promise<ExtraResponseDto> {
    return this.extrasService.update(id, updateExtraDto)
  }

  /**
   * Desactivar un extra
   */
  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Desactivar un extra' })
  @ApiResponse({ status: 200, description: 'Extra desactivado', type: ExtraResponseDto })
  async deactivate(@Param('id') id: string): Promise<ExtraResponseDto> {
    return this.extrasService.deactivate(id)
  }

  /**
   * Activar un extra
   */
  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Activar un extra' })
  @ApiResponse({ status: 200, description: 'Extra activado', type: ExtraResponseDto })
  async activate(@Param('id') id: string): Promise<ExtraResponseDto> {
    return this.extrasService.activate(id)
  }

  /**
   * Asociar un extra a un paquete
   */
  @Post('attach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Asociar un extra a un paquete' })
  async attachToPackage(@Body() body: { extraId: string; paqueteId: string }) {
    if (!body.extraId || !body.paqueteId) {
      throw new BadRequestException('extraId and paqueteId are required')
    }
    return this.extrasService.attachToPackage(body.extraId, body.paqueteId)
  }

  /**
   * Desasociar un extra de un paquete
   */
  @Delete(':extraId/packages/:paqueteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Desasociar un extra de un paquete' })
  async detachFromPackage(@Param('extraId') extraId: string, @Param('paqueteId') paqueteId: string) {
    return this.extrasService.detachFromPackage(extraId, paqueteId)
  }
}
