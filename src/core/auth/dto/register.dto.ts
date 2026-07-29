import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre de usuario',
    type: String,
    example: 'Jon Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Correo electrónico',
    type: String,
    example: 'jondoe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil (opcional)',
    type: String,
    example: 'https://example.com/profile.jpg',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'Identificador único del usuario en el proveedor de autenticación (sub)',
    type: String,
    example: 'auth0|1234567890abcdef',
    required: false,
  })
  @IsString()
  @IsOptional()
  sub?: string;
}