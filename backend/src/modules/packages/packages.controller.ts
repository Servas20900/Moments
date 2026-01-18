import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PackagesService } from './packages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePackageDto } from './dtos/create-package.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';

@ApiTags('Paquetes')
@Controller('paquetes')
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar paquetes (solo activos)' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const s = Number(skip ?? 0);
    const t = Number(take ?? 10);
    return this.packagesService.findAll(Number.isFinite(s) ? s : 0, Number.isFinite(t) ? t : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener paquete por ID' })
  async findById(@Param('id') id: string) {
    return this.packagesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Crear paquete (admin)' })
  async create(@Body() body: any) {
    const dto: CreatePackageDto = {
      categoriaId: Number(body.categoriaId ?? body.categoryId ?? 1),
      nombre: body.nombre ?? body.name ?? '',
      descripcion: body.descripcion ?? body.description ?? '',
      precioBase: Number(body.precioBase ?? body.price ?? 0),
      maxPersonas: Number(body.maxPersonas ?? body.maxPeople ?? 0),
    };
    return this.packagesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Actualizar paquete (admin)' })
  async update(@Param('id') id: string, @Body() body: any) {
    const dto: UpdatePackageDto = {
      categoriaId: body.categoriaId ?? body.categoryId,
      nombre: body.nombre ?? body.name,
      descripcion: body.descripcion ?? body.description,
      precioBase: body.precioBase ?? body.price,
      maxPersonas: body.maxPersonas ?? body.maxPeople,
    };
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Eliminar (soft delete) paquete (admin)' })
  async delete(@Param('id') id: string) {
    return this.packagesService.delete(id);
  }
}
