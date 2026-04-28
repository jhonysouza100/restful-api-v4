// Obtiene el usuario de la token de Header: "Cookies: auth-token"
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { jwtConstants } from "../../../common/constants";
import { AuthContextRequest } from "../auth.context";
import { TokenInterface } from '../interfaces/token.interface';

@Injectable()
export class CookiesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authContextRequest: AuthContextRequest
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const cookie = request.cookies?.['auth-token'];

    if(!cookie) throw new UnauthorizedException('No se encontraron cookies de session');

    try {
      const payload: TokenInterface = await this.jwtService.verifyAsync(cookie, {secret: jwtConstants.secret});

      // console.log(payload); // Log the payload for debugging purposes

      // (Antes) Guarda las credenciales del auth en un contexto
      // Otros servicios pueden acceder al tenant actual inyectando AuthContextRequest
      this.authContextRequest.setAuthData(payload);


      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }

    return true;
  }
}