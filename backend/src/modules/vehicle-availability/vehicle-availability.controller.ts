import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { VehicleAvailabilityService } from './vehicle-availability.service';
import { CreateBlockDto } from './dtos/create-block.dto';

@ApiTags('Disponibilidad de Vehículos')
@Controller('vehicle-availability')
export class VehicleAvailabilityController {
  constructor(
    private readonly vehicleAvailabilityService: VehicleAvailabilityService,
  ) {}

  @Get('check')
  @ApiOperation({ summary: 'Verificar disponibilidad de un vehículo en una fecha' })
  @ApiQuery({ name: 'vehiculoId', required: true, example: 'cm5xmb3ym00004m7a5wvg6p43' })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-02-15' })
  async checkAvailability(
    @Query('vehiculoId') vehiculoId: string,
    @Query('fecha') fecha: string,
  ) {
    return this.vehicleAvailabilityService.checkAvailability(vehiculoId, fecha);
  }

  @Get(':vehiculoId/blocks')
  @ApiOperation({ summary: 'Listar bloqueos de un vehículo (solo futuros)' })
  async getAllBlocks(@Param('vehiculoId') vehiculoId: string) {
    return this.vehicleAvailabilityService.getAllBlocksByVehicle(vehiculoId);
  }

  @Get('calendar')
  @ApiOperation({ summary: 'Obtener calendario unificado de disponibilidad (Admin) - Todos los vehículos o específico' })
  @ApiQuery({ name: 'year', required: true, example: 2026 })
  @ApiQuery({ name: 'month', required: true, example: 2 })
  @ApiQuery({ name: 'vehiculoId', required: false, description: 'Si no se envía, retorna agregado de todos los vehículos' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  async getCalendar(
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('vehiculoId') vehiculoId?: string,
  ) {
    return this.vehicleAvailabilityService.getUnifiedCalendar(
      parseInt(year, 10),
      parseInt(month, 10),
      vehiculoId,
    );
  }

  @Get(':vehiculoId/calendar')
  @ApiOperation({ summary: '[LEGACY] Obtener calendario mensual de disponibilidad (Admin)' })
  @ApiQuery({ name: 'year', required: true, example: 2026 })
  @ApiQuery({ name: 'month', required: true, example: 2 })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  async getMonthlyAvailability(
    @Param('vehiculoId') vehiculoId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.vehicleAvailabilityService.getMonthlyAvailability(
      vehiculoId,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Post('block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Crear bloqueo de fecha (Admin only)' })
  async createBlock(@Body() dto: CreateBlockDto) {
    return this.vehicleAvailabilityService.createBlock(dto);
  }

  @Delete('block/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Eliminar bloqueo (Admin only)' })
  async deleteBlock(@Param('id') id: string) {
    return this.vehicleAvailabilityService.deleteBlock(id);
  }
}
