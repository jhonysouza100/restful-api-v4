import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Role } from "../../../common/enums/roles.enum";

export class CreateAccessKeysDto {
  @ApiProperty({
    description: 'Clave secreta de la API del tenant para autenticación en endpoints protegidos.',
    example: 'x-api-abcdef1234567890',
  })
  @IsOptional()
  @IsString()
  x_api_key?: string;

  @ApiProperty({
    description: 'Identificador único del usuario en el proveedor de autenticación (sub)',
    example: 'auth0|1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  google_sub?: string;
}

export class CreateTenantDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    example: 'admin123',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Correo público de contacto del tenant',
    example: 'tenant1@gmail.com',
  })
  @IsOptional()
  @IsEmail()
  @Length(1, 320)
  email?: string;

  @ApiProperty({
    description: 'Contraseña',
    example: 'password123'
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Dominio del tenant (ej: mycompany.com)',
    example: 'mycompany.com',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/profile.jpg'
  })
  @IsOptional()
  @IsString()
  picture?: string;
  
  @ApiProperty({ description: 'El ROL del un tenant', example: Role.ADMIN })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    description: 'Indica si el tenant está verificado',
    example: true,
  })
  @IsOptional()
  verified?: boolean;

  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({
    description: 'Claves de acceso para autenticación en endpoints protegidos',
    type: CreateAccessKeysDto,
  })
  @Type(() => CreateAccessKeysDto)
  access_keys?: CreateAccessKeysDto;
}