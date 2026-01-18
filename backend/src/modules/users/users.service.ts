import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
        distrito: {
          include: {
            canton: {
              include: {
                provincia: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { contrasena, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      roles: user.roles.map((ur) => ur.rol),
    };
  }

  async findAll(skip: number = 0, take: number = 10) {
    const [users, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: { estado: 'ACTIVO' },
        skip,
        take,
        include: {
          roles: {
            include: {
              rol: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.usuario.count({ where: { estado: 'ACTIVO' } }),
    ]);

    const usersWithoutPassword = users.map((user) => {
      const { contrasena, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        roles: user.roles.map((ur) => ur.rol),
      };
    });

    return {
      data: usersWithoutPassword,
      total,
      skip,
      take,
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: {
        nombre: dto.nombre || user.nombre,
        telefono: dto.telefono || user.telefono,
        identificacion: dto.identificacion || user.identificacion,
        distritoId: dto.distritoId || user.distritoId,
      },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    const { contrasena, ...userWithoutPassword } = updated;
    return {
      ...userWithoutPassword,
      roles: updated.roles.map((ur) => ur.rol),
    };
  }

  async delete(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.usuario.update({
      where: { id },
      data: { estado: 'INACTIVO' },
    });

    return { message: 'User deactivated successfully' };
  }
}
