import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UseRoleAuthToken } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión', description: 'Permite a un usuario iniciar sesión proporcionando las credenciales necesarias.' })
  @ApiBody({ type: LoginDto, description: 'Credenciales del usuario para iniciar sesión (Nombre de usuario y contraseña).' })
  login(@Body() credentials: LoginDto) {
    try {
      return this.authService.login(credentials);
    } catch (error) {
      return error.message;
    }
  }

  @UseRoleAuthToken()
  @Get('verify')
  @ApiOperation({ summary: 'Verificar token', description: 'Verifica la validez de un token JWT.' })
  verify(@Req() request: any) {
    try {
        return request.user;
    } catch (error) {
      return error.message;
    }
  }
}
