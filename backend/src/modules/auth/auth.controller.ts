import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LoginDto } from "./dtos/login.dto";
import { RegisterDto } from "./dtos/register.dto";
import { ForgotPasswordDto } from "./dtos/forgot-password.dto";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @Throttle({ strict: { limit: 5, ttl: 60000 } }) // 5 registros por minuto
  @ApiOperation({ summary: "Register a new user" })
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.authService.register(dto);
    } catch (error) {
      console.error("[AUTH CONTROLLER] Register error:", error);
      throw error;
    }
  }

  @Post("login")
  @Throttle({ strict: { limit: 10, ttl: 60000 } }) // 10 intentos de login por minuto
  @ApiOperation({ summary: "Login user" })
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authService.login(dto);
    } catch (error) {
      console.error("[AUTH CONTROLLER] Login error:", error);
      throw error;
    }
  }

  @Post("forgot-password")
  @Throttle({ strict: { limit: 3, ttl: 60000 } })
  @ApiOperation({
    summary:
      "Request a password reset link (always returns a generic response)",
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("reset-password")
  @Throttle({ strict: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "Reset password using one-time token" })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access_token")
  @ApiOperation({ summary: "Alias current user profile" })
  async me(@Request() req: any) {
    return req.user;
  }
}
