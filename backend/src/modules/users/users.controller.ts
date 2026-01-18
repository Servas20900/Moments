import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dtos/update-user.dto';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Listar usuarios (admin)' })
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const s = Number(skip ?? 0);
    const t = Number(take ?? 10);
    return this.usersService.findAll(Number.isFinite(s) ? s : 0, Number.isFinite(t) ? t : 10);
  }

  @Get('notificaciones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Listar notificaciones (placeholder)' })
  async notifications() {
    return [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  async updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Eliminar usuario' })
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
