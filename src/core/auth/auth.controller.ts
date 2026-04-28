import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
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
}
