import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { CreateTenantDto } from "./create-tenant.dto";

export class CorreoArgentinoDto {
  @ApiProperty({
    description: 'Nro. de cuenta en Correo Argentino',
    example: '0001201907'
  })
  @IsString()
  customer_id: string;

  @ApiProperty({
    description: 'Código postal del remitente',
    example: '1042'
  })
  @IsString()
  postal_code: string

  @ApiProperty({
    description: 'Usuario de la API de Correo Argentino',
    example: 'correo_argentino_user',
  })
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Contraseña de la API de Correo Argentino',
    example: 'correo_argentino_password',
  })
  @IsString()
  password: string;
}

export class CreatePrivateKeysDto {
  @ApiProperty({
    description: 'Contraseña de autenticación SMTP del tenant para enviar correos a través de Gmail. Para nuevos proyectos, utilice OAuth 2.0 (o una contraseña de la aplicación si ya tiene activada la verificación Google 2‑Step)',
    example: 'abc123_secure_password'
  })
  @IsOptional()
  @IsString()
  smtp?: string;
  
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
    description: 'Credenciales de la API de Correo Argentino',
    type: CorreoArgentinoDto,
  })
  @Type(() => CorreoArgentinoDto)
  @IsOptional()
  correo_argentino?: CorreoArgentinoDto;
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({
    description: 'Claves privadas para autenticación en servicios externos (ej: SMTP, Mercado Pago, Google Sheets, etc.)',
    type: CreatePrivateKeysDto,
  })
  @Type(() => CreatePrivateKeysDto)
  @IsOptional()
  private_keys: CreatePrivateKeysDto;
}