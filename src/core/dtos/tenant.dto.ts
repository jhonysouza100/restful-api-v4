import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class EmailCredentialsDto {
  @ApiProperty({
    description: 'Contraseña utilizada para la autenticación SMTP',
    example: 'abc123_secure_password'
  })
  @IsString()
  @IsNotEmpty()
  pass: string;
  
  @ApiProperty({
    description: 'Correo electrónico del remitente utilizado para la autenticación SMTP',
    example: 'tenant1@gmail.com'
  })
  @Length(1, 320)
  @IsEmail()
  user: string;
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
    description: 'Credenciales de autenticación SMTP del tenant para enviar correos a través de Gmail. Para nuevos proyectos, utilice OAuth 2.0 (o una contraseña de la aplicación si ya tiene activada la verificación Google 2‑Step)',
    type: EmailCredentialsDto,
  })
  @Type(() => EmailCredentialsDto)
  email: EmailCredentialsDto;

  @ApiProperty({
    description: 'Contraseña',
    example: 'password123'
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/profile.jpg'
  })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiProperty({
    description: 'Identificador único del usuario en el proveedor de autenticación (sub)',
    example: 'auth0|1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  sub?: string;
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({
    description: 'Clave secreta de la API de Mercadopago',
    example: 'mercadopago_secret|1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  mercadopago?: string;
  
  @ApiProperty({
    description: 'Id de la hoja de calculos en gooogle sheets',
    example: '1XYZ-QWERTY',
  })
  @IsOptional()
  @IsString()
  spreadsheets?: string;
 
  @ApiProperty({
    description: 'Nombre de la empresa',
    example: 'Mi Empresa',
  })
  @IsOptional()
  @IsString()
  company?: string;
}