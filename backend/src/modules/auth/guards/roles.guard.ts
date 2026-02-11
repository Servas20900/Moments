import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "../roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    const roles = Array.isArray(user.roles)
      ? user.roles
          .map((r: any) => {
            if (typeof r === "string") return r;
            if (r?.rol?.codigo) return r.rol.codigo;
            if (r?.codigo) return r.codigo;
            return null;
          })
          .filter(Boolean)
      : [];

    return requiredRoles.some((role) => roles.includes(role));
  }
}
