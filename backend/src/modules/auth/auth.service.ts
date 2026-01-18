import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.contrasena, 10);

    const user = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        contrasena: hashedPassword,
        nombre: dto.nombre,
        telefono: dto.telefono || '',
        identificacion: dto.identificacion,
        distritoId: dto.distritoId,
        estado: 'ACTIVO',
      },
    });

    // Asignar rol de usuario por defecto
    const rolUsuario = await this.prisma.rol.findFirst({
      where: { codigo: 'USER' },
    });

    if (rolUsuario) {
      await this.prisma.usuarioRol.create({
        data: {
          usuarioId: user.id,
          rolId: rolUsuario.id,
        },
      });
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return this.toResponse(access_token, user);
  }

  async login(dto: LoginDto) {
    try {
      console.log(`[AUTH] Login attempt for: ${dto.email}`);
      
      const user = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
        include: {
          roles: {
            include: {
              rol: true,
            },
          },
        },
      });

      if (!user) {
        console.log(`[AUTH] User not found: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`[AUTH] User found: ${user.email}`);

      if (!dto.contrasena) {
        console.log('[AUTH] No password provided');
        throw new BadRequestException('Password field is required');
      }

      console.log(`[AUTH] Comparing password for user: ${user.email}`);
      const passwordMatches = await bcrypt.compare(dto.contrasena, user.contrasena);
      console.log(`[AUTH] Password matches: ${passwordMatches}`);

      if (!passwordMatches) {
        console.log(`[AUTH] Password mismatch for: ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log(`[AUTH] Signing JWT token for: ${user.email}`);
      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      console.log(`[AUTH] Login successful for: ${user.email}`);
      return this.toResponse(access_token, user);
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      throw error;
    }
  }

  async validateUser(payload: any) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: {
        roles: {
          include: {
            rol: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private toResponse(access_token: string, user: any) {
    const roles = user.roles?.map((ur: any) => ur.rol.codigo) || [];
    return {
      access_token,
      token: access_token,
      expiresIn: 86400,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        telefono: user.telefono,
        roles: roles,
        estado: user.estado,
      },
    };
  }
}
