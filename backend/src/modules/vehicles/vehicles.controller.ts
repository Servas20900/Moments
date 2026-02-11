import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";
import { VehiclesService } from "./vehicles.service";
import { CreateVehicleDto } from "./dtos/create-vehicle.dto";
import { UpdateVehicleDto } from "./dtos/update-vehicle.dto";

@ApiTags("Vehiculos")
@Controller("vehiculos")
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: "Listar vehiculos (solo activos)" })
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("categoria") categoria?: string,
    @Query("estado") estado?: string,
  ) {
    const s = Number(skip ?? 0);
    const t = Number(take ?? 10);
    const est = estado?.toUpperCase();

    return this.vehiclesService.findAll({
      skip: Number.isFinite(s) ? s : 0,
      take: Number.isFinite(t) ? t : 10,
      categoria,
      estado: est === "ACTIVO" || est === "INACTIVO" ? est : "ACTIVO",
    });
  }

  @Get("disponibilidad")
  @ApiOperation({ summary: "Consultar disponibilidad por rango horario" })
  async availability(
    @Query("fecha") fecha?: string,
    @Query("horaInicio") horaInicio?: string,
    @Query("horaFin") horaFin?: string,
  ) {
    return this.vehiclesService.getAvailability({ fecha, horaInicio, horaFin });
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener vehiculo por ID" })
  async findById(@Param("id") id: string) {
    return this.vehiclesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear vehiculo (admin)" })
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar vehiculo (admin)" })
  async update(@Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Eliminar (soft delete) vehiculo (admin)" })
  async delete(@Param("id") id: string) {
    return this.vehiclesService.delete(id);
  }
}
