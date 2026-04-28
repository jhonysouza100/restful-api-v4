import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { jwtConstants } from '../../common/constants';
import { TenantsService } from '../tenant/tenants.service';
import { LoginDto } from './dto/login.dto';
import { TokenInterface } from './interfaces/token.interface';

@Injectable()
export class AuthService {
  constructor (
    private jwtService: JwtService,
    private readonly tenantService: TenantsService,
  ) {}

  async login(credentials: LoginDto): Promise<{ token: string, payload: TokenInterface }> {
    const userFound = await this.tenantService.findOneByName(credentials.name);

    // brypt compare
    const checkPassword = await compare(credentials.password, userFound.password);
    if(!checkPassword) throw new UnauthorizedException('Contraseña incorrecta');

    const payload: TokenInterface = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      picture: userFound.picture,
    };

    // Genera el token JWT
    const token = await this.jwtService.signAsync(payload);
    
    return { token, payload };
  }

  async verify(token: string): Promise<TokenInterface> {
    try {
      const payload: TokenInterface = await this.jwtService.verifyAsync(token, {secret: jwtConstants.secret});

      // console.log(payload); // Log the payload for debugging purposes

      return payload;
    } catch {
      throw new UnauthorizedException('Sesión expirada');
    }
  }

  /** PARA USUARIOS
  async googleRegister(user: RegisterDto): Promise<{ token: string, payload: TokenInterface }> {
    await this.userService.createGoogleUser(user);
    
    return this.googleLogin(user.sub);
  }

  async googleLogin(sub: string): Promise<{ token: string, payload: TokenInterface }> {
    const userFound = await this.userService.findOneBySub(sub);

    const payload: TokenInterface = {
      id: userFound.id,
      name: userFound.name,
      email: userFound.email,
      role: userFound.role,
      picture: userFound.picture,
    };

    // Genera el token JWT
    const token = await this.jwtService.signAsync(payload);
    
    return { token, payload };
  }
  */
}