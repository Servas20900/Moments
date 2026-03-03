import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { NotificacionesService } from './notificaciones.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@ApiTags('Notificaciones')
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  async obtenerNotificaciones(@Request() req: any) {
    return this.notificacionesService.obtenerNotificacionesUsuario(req.user.id)
  }

  @Patch(':id/leer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  async marcarComoLeida(@Param('id') id: string) {
    return this.notificacionesService.marcarComoLeida(id)
  }

  @Patch('marcar-todas-leidas')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  async marcarTodasComoLeidas(@Request() req: any) {
    return this.notificacionesService.marcarTodasComoLeidas(req.user.id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access_token')
  @ApiOperation({ summary: 'Eliminar notificación' })
  async eliminarNotificacion(@Param('id') id: string) {
    return this.notificacionesService.eliminarNotificacion(id)
  }
}
