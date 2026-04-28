import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/constants';
import { Role } from '../../../common/enums/roles.enum';

// Este guard autoriza el usuario recibido atravez del decorador @Roles('etc'), dependiendo si el rol coinside con el rol del usuario
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean  {
    const roleParam = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // Si no se especifica el requerimiento de un rol. Autoriza la entrada
    if(!roleParam) return true;

    // Obtiene el objeto user del middleware bearer.guard extraido desde el jwt dela cebecera 'Bearer token'
    const { user } = context.switchToHttp().getRequest();

    if(user.role === Role.ADMIN || user.role === Role.ROOT) return true; // Si el usuario es un ADMIN en adelante, tiene acceso permitido


    return roleParam === user.role;
  }
  
}