// Obtiene el usuario de la token de Header: "Authorization: Bearer"
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../../../common/constants';
import { AuthContextRequest } from '../auth.context';
import { TokenInterface } from '../interfaces/token.interface';

@Injectable()
export class BearerGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authContextRequest: AuthContextRequest
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Debes iniciar sesión');

    try {
      const payload: TokenInterface = await this.jwtService.verifyAsync(token, {secret: jwtConstants.secret});

      // console.log(payload); // Log the payload for debugging purposes

      // (Antes) Guarda las credenciales del auth en un contexto
      // Otros servicios pueden acceder al tenant actual inyectando AuthContextRequest
      this.authContextRequest.setAuthData(payload);

      request['user'] = payload;
    } catch {
      throw new HttpException('Sesión expirada', HttpStatus.NO_CONTENT);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
  
}