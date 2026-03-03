import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { EmailService } from "../../common/email/email.service";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private readonly FORGOT_PASSWORD_GENERIC_MESSAGE =
    "Si el correo existe, te enviaremos instrucciones para restablecer tu contraseña.";

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

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (!user || user.estado !== "ACTIVO") {
      return { message: this.FORGOT_PASSWORD_GENERIC_MESSAGE };
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = this.hashResetToken(rawToken);
    const now = new Date();
    const resetTtlMinutes = Number(
      this.configService.get<string>("RESET_PASSWORD_TTL_MINUTES") ?? 30,
    );
    const expiresAt = new Date(now.getTime() + resetTtlMinutes * 60 * 1000);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: {
          usuarioId: user.id,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });

      await tx.passwordResetToken.create({
        data: {
          usuarioId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const frontendUrl =
      this.configService.get<string>("FRONTEND_URL") || "http://localhost:5173";
    const baseUrl = frontendUrl.endsWith("/")
      ? frontendUrl.slice(0, -1)
      : frontendUrl;
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await this.emailService.sendPasswordResetEmail({
      nombre: user.nombre || "usuario",
      email: user.email,
      resetUrl,
      expiresMinutes: resetTtlMinutes,
    });

    return { message: this.FORGOT_PASSWORD_GENERIC_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (dto.nuevaPassword !== dto.confirmarPassword) {
      throw new BadRequestException("Las contraseñas no coinciden");
    }

    const tokenHash = this.hashResetToken(dto.token.trim());
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (
      !tokenRecord ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException("El token es inválido o ha expirado");
    }

    const hashedPassword = await bcrypt.hash(dto.nuevaPassword, 10);
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: tokenRecord.usuarioId },
        data: {
          contrasena: hashedPassword,
          actualizadoEn: now,
        },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          usuarioId: tokenRecord.usuarioId,
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });
    });

    return { message: "Contraseña restablecida correctamente" };
  }

  private hashResetToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
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
