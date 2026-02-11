import { Body, Controller, Get, Patch, Param, Post, UseGuards, Query, Request } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from "@nestjs/swagger";
import { ReservationsService } from "./reservations.service";
import { CreateReservationDto } from "./dtos/create-reservation.dto";
import { CreateManualReservationDto } from "./dtos/create-manual-reservation.dto";
import { MarkPaymentCompleteDto } from "./dtos/mark-payment-complete.dto";
import { 
  UpdateEstadoContactoDto, 
  UpdateAdelantoRecibidoDto, 
  UpdatePagoCompletoDto, 
  UpdateChoferAsignadoDto, 
  UpdateEventoRealizadoDto,
  QueryReservasDto
} from "./dtos/update-estado-operativo.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";

@ApiTags("Reservas")
@Controller("reservas")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Listar reservas con filtros (admin)" })
  @ApiQuery({ name: 'vehiculoId', required: false, description: 'Filtrar por vehículo específico' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (PAGO_PENDIENTE, PAGO_PARCIAL, CONFIRMADA, CANCELADA, COMPLETADA)' })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD)' })
  async findAll(
    @Query('vehiculoId') vehiculoId?: string,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.reservationsService.findAll({
      vehiculoId,
      estado,
      desde,
      hasta,
    });
  }

  @Post()
  @ApiOperation({ summary: "Crear reserva (publico)" })
  async create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Patch(":id/pago/adelanto")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Confirmar recepción de adelanto (admin)" })
  async confirmAdelanto(@Param("id") id: string) {
    return this.reservationsService.confirmAdelanto(id);
  }

  @Patch(":id/pago/completo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Confirmar pago completo (admin)" })
  async confirmPagoCompleto(@Param("id") id: string) {
    return this.reservationsService.confirmPagoCompleto(id);
  }

  // ==================== NUEVOS ENDPOINTS ADMIN ====================

  @Post("admin/manual")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear reserva manual desde admin (externas: WhatsApp, correo, teléfono)" })
  async createManual(@Body() dto: CreateManualReservationDto, @Request() req: any) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.createManual(dto, adminUser);
  }

  @Post(":id/admin/pago-completo-manual")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Marcar pago completo manual (pagos externos al sistema)" })
  async markPaymentCompleteManual(
    @Param("id") id: string,
    @Body() dto: MarkPaymentCompleteDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.markPaymentCompleteManual(id, dto, adminUser);
  }

  @Patch(":id/admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Editar reserva (controlado: conductor, horario, vehículo, estado)" })
  async updateReservation(
    @Param("id") id: string,
    @Body() dto: any,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updateReservation(id, dto, adminUser);
  }

  // ==================== ENDPOINTS PARA TABLA ADMINISTRATIVA ====================

  @Get("admin/table")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Listar reservas para tabla administrativa (con filtros, búsqueda, paginación)" })
  async findAllForTable(@Query() query: QueryReservasDto) {
    return this.reservationsService.findAllWithFilters(query);
  }

  @Patch(":id/admin/contacto-cliente")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar estado de contacto con cliente" })
  async updateContactoCliente(
    @Param("id") id: string,
    @Body() dto: UpdateEstadoContactoDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updateContactoCliente(id, dto.contactoCliente, adminUser);
  }

  @Patch(":id/admin/adelanto-recibido")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar si el adelanto fue recibido" })
  async updateAdelantoRecibido(
    @Param("id") id: string,
    @Body() dto: UpdateAdelantoRecibidoDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updateAdelantoRecibido(id, dto.adelantoRecibido, adminUser);
  }

  @Patch(":id/admin/pago-completo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar si el pago está completo" })
  async updatePagoCompleto(
    @Param("id") id: string,
    @Body() dto: UpdatePagoCompletoDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updatePagoCompleto(id, dto.pagoCompleto, adminUser);
  }

  @Patch(":id/admin/chofer-asignado")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar si el chofer fue asignado" })
  async updateChoferAsignado(
    @Param("id") id: string,
    @Body() dto: UpdateChoferAsignadoDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updateChoferAsignado(id, dto.choferAsignado, adminUser);
  }

  @Patch(":id/admin/evento-realizado")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar si el evento fue realizado" })
  async updateEventoRealizado(
    @Param("id") id: string,
    @Body() dto: UpdateEventoRealizadoDto,
    @Request() req: any
  ) {
    const adminUser = req.user?.email || req.user?.nombre || 'Admin';
    return this.reservationsService.updateEventoRealizado(id, dto.eventoRealizado, adminUser);
  }
}
