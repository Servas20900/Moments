import { Injectable, NotFoundException } from '@nestjs/common'
import { EstadoActivo } from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'

@Injectable()
export class ExtrasService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { estado?: EstadoActivo } = {}): Promise<any[]> {
    const estado = params.estado ?? EstadoActivo.ACTIVO
    const extras = await this.prisma.extra.findMany({
      where: { estado },
      orderBy: { creadoEn: 'desc' },
    })
    return extras.map((e) => this.toResponse(e))
  }

  async findByPackageId(paqueteId: string): Promise<any[]> {
    const pkg = await this.prisma.paquete.findUnique({ where: { id: paqueteId } })
    if (!pkg) throw new NotFoundException('Package not found')

    const links = await this.prisma.paqueteExtra.findMany({
      where: { paqueteId },
      include: { extra: true },
      orderBy: { extra: { creadoEn: 'desc' } },
    })
    return links.map((l) => this.toResponse(l.extra))
  }

  async create(data: { nombre: string; descripcion?: string; precio: number; estado?: EstadoActivo }): Promise<any> {
    const created = await this.prisma.extra.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        estado: data.estado ?? EstadoActivo.ACTIVO,
      },
    })
    return this.toResponse(created)
  }

  async attachToPackage(extraId: string, paqueteId: string): Promise<any> {
    // ensure exist
    const [extra, pkg] = await Promise.all([
      this.prisma.extra.findUnique({ where: { id: extraId } }),
      this.prisma.paquete.findUnique({ where: { id: paqueteId } }),
    ])
    if (!extra) throw new NotFoundException('Extra not found')
    if (!pkg) throw new NotFoundException('Package not found')

    await this.prisma.paqueteExtra.upsert({
      where: { paqueteId_extraId: { paqueteId, extraId } },
      create: { paqueteId, extraId },
      update: {},
    })
    return { ok: true }
  }

  private toResponse(e: any): any {
    return {
      id: e.id,
      name: e.nombre,
      description: e.descripcion || '',
      price: Number(e.precio),
      estado: e.estado,
    }
  }
}
