import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

/**
 * Garde vérifiant si l'utilisateur possède l'un des rôles requis pour accéder à la ressource.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est configuré, on laisse passer (la route est protégée par JWT uniquement)
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Vérification du rôle utilisateur présent dans le payload du token décodé
    const hasRole = requiredRoles.some((role) => user.role?.toLowerCase() === role.toLowerCase());

    if (!hasRole) {
      throw new ForbiddenException(`Vous n'avez pas les privilèges requis (${requiredRoles.join(', ')}) pour cette opération.`);
    }

    return true;
  }
}
