import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dtos/create-reservation.dto';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reservas' })
  async findAll() {
    return this.reservationsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear reserva (publico)' })
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }
}