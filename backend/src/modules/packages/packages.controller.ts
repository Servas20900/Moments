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
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UseInterceptors } from "@nestjs/common";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { Throttle } from "@nestjs/throttler";
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
  constructor(private packagesService: PackagesService) {}

  @Get("categorias")
  @ApiOperation({ summary: "Listar categorías de paquetes" })
  async findAllCategories() {
    return this.packagesService.findAllCategories();
  }

  @Post("categorias")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear categoría de paquete (admin)" })
  async createCategory(@Body() body: any) {
    return this.packagesService.createCategory(body?.nombre ?? body?.name ?? "");
  }

  @Put("categorias/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar categoría de paquete (admin)" })
  async updateCategory(@Param("id") id: string, @Body() body: any) {
    return this.packagesService.updateCategory(Number(id), body?.nombre ?? body?.name ?? "");
  }

  @Delete("categorias/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Eliminar categoría de paquete (admin)" })
  async deleteCategory(
    @Param("id") id: string,
    @Query("fallbackCategoryId") fallbackCategoryId?: string,
  ) {
    return this.packagesService.deleteCategory(Number(id), Number(fallbackCategoryId));
  }

  @Get()
  @Throttle({ default: { limit: 300, ttl: 60000 } })
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
      incluidos: Array.isArray(body.incluidos)
        ? body.incluidos
        : Array.isArray(body.incluye)
          ? body.incluye
          : Array.isArray(body.includes)
            ? body.includes
            : undefined,
    };
    return this.packagesService.create(dto);
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
      incluidos: Array.isArray(body.incluidos)
        ? body.incluidos
        : Array.isArray(body.incluye)
          ? body.incluye
          : Array.isArray(body.includes)
            ? body.includes
            : undefined,
    };
    return this.packagesService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Eliminar (soft delete) paquete (admin)" })
  async delete(@Param("id") id: string) {
    return this.packagesService.delete(id);
  }
}
