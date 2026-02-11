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
  Inject,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { PackagesService } from "./packages.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";
import { CreatePackageDto } from "./dtos/create-package.dto";
import { UpdatePackageDto } from "./dtos/update-package.dto";

@ApiTags("Paquetes")
@Controller("paquetes")
export class PackagesController {
  constructor(
    private packagesService: PackagesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get("categorias/list")
  @ApiOperation({ summary: "Listar categorías de paquetes" })
  async getCategories() {
    return this.packagesService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: "Listar paquetes (solo activos)" })
  @UseInterceptors(CacheInterceptor)
  async findAll(
    @Query("skip") skip?: string,
    @Query("take") take?: string,
    @Query("categoriaId") categoriaId?: string,
    @Query("estado") estado?: string,
  ) {
    const s = Number(skip ?? 0);
    const t = Number(take ?? 10);
    const catId = categoriaId ? Number(categoriaId) : undefined;
    const est = estado?.toUpperCase();

    return this.packagesService.findAll({
      skip: Number.isFinite(s) ? s : 0,
      take: Number.isFinite(t) ? t : 10,
      categoriaId: Number.isFinite(catId) ? catId : undefined,
      estado: est === "ACTIVO" || est === "INACTIVO" ? est : "ACTIVO",
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener paquete por ID" })
  async findById(@Param("id") id: string) {
    return this.packagesService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear paquete (admin)" })
  async create(@Body() body: any) {
    const dto: CreatePackageDto = {
      categoriaId: Number(body.categoriaId ?? body.categoryId ?? 1),
      nombre: body.nombre ?? body.name ?? "",
      descripcion: body.descripcion ?? body.description ?? "",
      precioBase: Number(body.precioBase ?? body.price ?? 0),
      maxPersonas: Number(body.maxPersonas ?? body.maxPeople ?? 0),
      vehicleIds: Array.isArray(body.vehicleIds) ? body.vehicleIds : undefined,
    };
    const created = await this.packagesService.create(dto);
    await this.cacheManager.reset();
    return created;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar paquete (admin)" })
  async update(@Param("id") id: string, @Body() body: any) {
    const dto: UpdatePackageDto = {
      categoriaId: body.categoriaId ?? body.categoryId,
      nombre: body.nombre ?? body.name,
      descripcion: body.descripcion ?? body.description,
      precioBase: body.precioBase ?? body.price,
      maxPersonas: body.maxPersonas ?? body.maxPeople,
      vehicleIds: Array.isArray(body.vehicleIds) ? body.vehicleIds : undefined,
    };
    const updated = await this.packagesService.update(id, dto);
    await this.cacheManager.reset();
    return updated;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Eliminar (soft delete) paquete (admin)" })
  async delete(@Param("id") id: string) {
    const result = await this.packagesService.delete(id);
    await this.cacheManager.reset();
    return result;
  }
}
