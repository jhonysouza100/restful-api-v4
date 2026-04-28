import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { CreateTenantDto } from "./create-tenant.dto";

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
}

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiProperty({
    description: 'Claves privadas para autenticación en servicios externos (ej: SMTP, Mercado Pago, Google Sheets, etc.)',
    type: CreatePrivateKeysDto,
  })
  @Type(() => CreatePrivateKeysDto)
  private_keys: CreatePrivateKeysDto;
}