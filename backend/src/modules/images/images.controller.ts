import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Inject,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoriaImagen, EstadoActivo } from "@prisma/client";
import { ImagesService } from "./images.service";
import { CreateImageDto } from "./dtos/create-image.dto";
import { UpdateImageDto } from "./dtos/update-image.dto";
import { AttachImageToPackageDto } from "./dtos/attach-image-to-package.dto";
import { AttachImageToVehicleDto } from "./dtos/attach-image-to-vehicle.dto";
import { AttachImageToEventDto } from "./dtos/attach-image-to-event.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import type { Express } from "express";

@ApiTags("Imágenes")
@Controller("imagenes")
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar imágenes con filtros opcionales" })
  async findAll(
    @Query("categoria") categoria?: CategoriaImagen,
    @Query("estado") estado?: EstadoActivo,
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    const s = Number(skip ?? 0);
    const t = Number(take ?? 20);

    return this.imagesService.findAll({
      categoria,
      estado,
      skip: Number.isFinite(s) ? s : 0,
      take: Number.isFinite(t) ? t : 20,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener imagen por ID con relaciones" })
  async findOne(@Param("id") id: string) {
    return this.imagesService.findOne(id);
  }

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (_req, file, cb) => {
        const allowedMimes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              "Tipo de archivo no permitido. Solo imágenes (jpg, png, gif, webp)",
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiBearerAuth("access_token")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
        folder: { type: "string" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: "Subir archivo a Cloudinary (firmado en servidor)" })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("folder") folder?: string,
  ) {
    if (!file) return { message: "Archivo no proporcionado" };
    const { url } = await this.imagesService.uploadBuffer(file, folder);
    return { url };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear imagen (admin)" })
  async create(@Body() dto: CreateImageDto) {
    return this.imagesService.create(dto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar metadata de imagen (admin)" })
  async update(@Param("id") id: string, @Body() dto: UpdateImageDto) {
    return this.imagesService.update(id, dto);
  }

  // Alias PUT para compatibilidad con frontend
  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar metadata de imagen (admin) - alias PUT" })
  async updatePut(@Param("id") id: string, @Body() dto: UpdateImageDto) {
    return this.imagesService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Desactivar imagen (admin)" })
  async deactivate(@Param("id") id: string) {
    return this.imagesService.deactivate(id);
  }

  @Post(":id/paquetes")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Asociar imagen a paquete con orden (admin)" })
  async attachToPackage(
    @Param("id") id: string,
    @Body() dto: AttachImageToPackageDto,
  ) {
    const result = await this.imagesService.attachToPackage(id, dto);
    await this.cacheManager.reset();
    return result;
  }

  @Post(":id/vehiculos")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Asociar imagen a vehículo con orden (admin)" })
  async attachToVehicle(
    @Param("id") id: string,
    @Body() dto: AttachImageToVehicleDto,
  ) {
    const result = await this.imagesService.attachToVehicle(id, dto);
    await this.cacheManager.reset();
    return result;
  }

  @Post(":id/eventos")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Asociar imagen a evento con orden (admin)" })
  async attachToEvent(
    @Param("id") id: string,
    @Body() dto: AttachImageToEventDto,
  ) {
    const result = await this.imagesService.attachToEvent(id, dto);
    await this.cacheManager.reset();
    return result;
  }
}
