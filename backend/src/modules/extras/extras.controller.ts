import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ExtrasService } from './extras.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Extras')
@Controller('extras')
export class ExtrasController {
  constructor(private extras: ExtrasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar extras activos' })
  async findAll() {
    return this.extras.findAll({ estado: 'ACTIVO' as any })
  }

  @Get('paquetes/:id')
  @ApiOperation({ summary: 'Listar extras asociados a un paquete' })
  async findByPackage(@Param('id') paqueteId: string) {
    return this.extras.findByPackageId(paqueteId)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Crear extra (admin)' })
  async create(@Body() body: any) {
    return this.extras.create({
      nombre: body.nombre ?? body.name,
      descripcion: body.descripcion ?? body.description,
      precio: Number(body.precio ?? body.price ?? 0),
    })
  }

    @Post('attach')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access_token')
    @ApiOperation({ summary: 'Asociar extra a paquete (admin)' })
    async attach(@Body() body: any) {
      return this.extras.attachToPackage(body.extraId, body.paqueteId)
    }
}
