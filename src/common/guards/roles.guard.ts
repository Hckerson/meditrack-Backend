import { Reflector } from '@nestjs/core';
import { Role } from 'generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { session } = context.switchToHttp().getRequest();
    const { roles } = session.user;
    return requiredRoles.some((role) => roles?.includes(role));
  }
}
