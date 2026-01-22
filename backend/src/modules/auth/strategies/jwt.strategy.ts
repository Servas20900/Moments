import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Token inválido');
      }
      
      const user = await this.authService.validateUser(payload);
      
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      
      if (user.estado !== 'ACTIVO') {
        throw new UnauthorizedException('Usuario inactivo o suspendido');
      }
      
      return user;
    } catch (error) {
      console.error('[JWT STRATEGY] Validation error:', error);
      throw new UnauthorizedException('Autenticación inválida');
    }
  }
}
