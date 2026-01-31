import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      // Validar email único
      const existingUser = await this.prisma.usuario.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException("El email ya está registrado");
      }

      // Validar que el email esté en formato correcto
      if (!dto.email || !dto.email.includes("@")) {
        throw new BadRequestException("Email inválido");
      }

      // Validar nombre
      if (!dto.nombre || dto.nombre.trim().length < 2) {
        throw new BadRequestException(
          "El nombre debe tener al menos 2 caracteres",
        );
      }

      const hashedPassword = await bcrypt.hash(dto.contrasena, 10);

      const user = await this.prisma.usuario.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          contrasena: hashedPassword,
          nombre: dto.nombre.trim(),
          telefono: dto.telefono?.trim() || "",
          identificacion: dto.identificacion?.trim(),
          distritoId: dto.distritoId,
          estado: "ACTIVO",
        },
      });

      // Asignar rol de usuario por defecto
      const rolUsuario = await this.prisma.rol.findFirst({
        where: { codigo: "USER" },
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
    } catch (error) {
      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      // Normalizar email
      const email = dto.email.toLowerCase().trim();

      const user = await this.prisma.usuario.findUnique({
        where: { email },
        include: {
          roles: {
            include: {
              rol: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException("Credenciales inválidas");
      }

      // Validar estado del usuario
      if (user.estado === "INACTIVO") {
        throw new UnauthorizedException(
          "Usuario inactivo. Contacta al administrador",
        );
      }

      if (user.estado === "SUSPENDIDO") {
        throw new UnauthorizedException(
          "Usuario suspendido. Contacta al administrador",
        );
      }

      if (!dto.contrasena) {
        throw new BadRequestException("La contraseña es requerida");
      }

      const passwordMatches = await bcrypt.compare(
        dto.contrasena,
        user.contrasena,
      );

      if (!passwordMatches) {
        throw new UnauthorizedException("Credenciales inválidas");
      }

      // Actualizar último acceso
      await this.prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoAcceso: new Date() },
      });

      const access_token = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });

      return this.toResponse(access_token, user);
    } catch (error) {
      throw error;
    }
  }

  async validateUser(payload: any) {
    try {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException("Token payload inválido");
      }

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
        throw new UnauthorizedException("Usuario no encontrado");
      }

      if (user.estado !== "ACTIVO") {
        throw new UnauthorizedException(`Usuario ${user.estado.toLowerCase()}`);
      }

      return user;
    } catch (error) {
      throw error;
    }
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
