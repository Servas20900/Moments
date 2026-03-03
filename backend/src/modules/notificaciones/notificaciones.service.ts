import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async obtenerNotificacionesUsuario(usuarioId: string) {
    return this.prisma.notificacion.findMany({
      where: { usuarioId },
      orderBy: { creadoEn: 'desc' },
      take: 50,
    })
  }

  async crearNotificacion(usuarioId: string, titulo: string, mensaje: string, tipo: string = 'RESERVA', reservaId?: string) {
    return this.prisma.notificacion.create({
      data: {
        usuarioId,
        titulo,
        mensaje,
        tipo,
        reservaId,
      },
    })
  }

  async marcarComoLeida(notificacionId: string) {
    return this.prisma.notificacion.update({
      where: { id: notificacionId },
      data: { leida: true },
    })
  }

  async marcarTodasComoLeidas(usuarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    })
  }

  async eliminarNotificacion(notificacionId: string) {
    return this.prisma.notificacion.delete({
      where: { id: notificacionId },
    })
  }
}
