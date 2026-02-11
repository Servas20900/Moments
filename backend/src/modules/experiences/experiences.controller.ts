import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Role } from "../auth/roles.enum";
import { ExperiencesService } from "./experiences.service";

@ApiTags("Experiencias")
@Controller("experiencias")
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  @ApiOperation({ summary: "Listar experiencias activas" })
  async findAll() {
    return this.experiencesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Crear experiencia (admin)" })
  async create(@Body() body: any) {
    return this.experiencesService.create(body);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Actualizar experiencia (admin)" })
  async update(@Param("id") id: string, @Body() body: any) {
    return this.experiencesService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Eliminar (soft) experiencia (admin)" })
  async delete(@Param("id") id: string) {
    return this.experiencesService.delete(id);
  }
}
