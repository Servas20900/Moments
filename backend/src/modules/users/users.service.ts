import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import * as bcrypt from 'bcrypt';

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

  async changePassword(id: string, dto: ChangePasswordDto) {
    // Validar que las contraseñas coincidan
    if (dto.nuevaPassword !== dto.confirmarPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // Validar que la nueva contraseña sea diferente a la actual
    if (dto.passwordAntigua === dto.nuevaPassword) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificar que la contraseña actual es correcta
    const passwordMatches = await bcrypt.compare(dto.passwordAntigua, user.contrasena);
    if (!passwordMatches) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(dto.nuevaPassword, 10);

    // Actualizar la contraseña
    await this.prisma.usuario.update({
      where: { id },
      data: {
        contrasena: hashedPassword,
        actualizadoEn: new Date(),
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}
