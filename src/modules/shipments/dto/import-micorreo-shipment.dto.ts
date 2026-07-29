import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { DeliveryTypeEnum } from '../enum/delivery-type.enum';

export class MiCorreoAddressDto {
  @ApiProperty({
    example: 'Av. Santa Fe',
    description: 'Nombre de la calle.',
  })
  @IsString()
  @IsOptional()
  streetName?: string;

  @ApiProperty({
    example: '1234',
    description: 'Altura o número de la calle.',
  })
  @IsString()
  @IsOptional()
  streetNumber?: string;

  @ApiPropertyOptional({
    example: '4',
    description: 'Piso (máximo 3 caracteres).',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  floor?: string;

  @ApiPropertyOptional({
    example: 'B',
    description: 'Departamento (máximo 3 caracteres).',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  apartment?: string;

  @ApiProperty({
    example: 'Buenos Aires',
    description: 'Ciudad.',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    example: 'B',
    description: 'Código de la provincia.',
  })
  @IsString()
  @IsOptional()
  provinceCode?: string;

  @ApiProperty({
    example: '1425',
    description: 'Código Postal.',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;
}

export class MiCorreoSenderDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del remitente. Si no se manda un nombre de remitente, se va insertar el nombre del Tenant',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: '01143210000',
    description: 'Teléfono del remitente.',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '5491161234567',
    description: 'Celular del remitente.',
  })
  @IsOptional()
  @IsString()
  cellPhone?: string;

  @ApiPropertyOptional({
    example: 'remitente@email.com',
    description: 'Correo electrónico del remitente.',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: MiCorreoAddressDto,
    description: 'Dirección de origen.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MiCorreoAddressDto)
  originAddress?: MiCorreoAddressDto;
}

export class MiCorreoRecipientDto {
  @ApiProperty({
    example: 'María Gómez',
    description: 'Nombre del destinatario.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '01143210000',
    description: 'Teléfono del destinatario.',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '5491161234567',
    description: 'Celular del destinatario.',
  })
  @IsOptional()
  @IsString()
  cellPhone?: string;

  @ApiProperty({
    example: 'destinatario@email.com',
    description: 'Correo electrónico del destinatario.',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class MiCorreoShippingDto {
  @ApiProperty({
    enum: DeliveryTypeEnum,
    enumName: 'DeliveryTypeEnum',
    example: DeliveryTypeEnum.BRANCH,
    description: 'D = Envío a domicilio, S = Envío a sucursal.',
  })
  @IsEnum(DeliveryTypeEnum)
  deliveryType: DeliveryTypeEnum;

  @ApiPropertyOptional({
    example: '123',
    description: 'Código de sucursal. Obligatorio únicamente cuando deliveryType = "S".',
  })
  @IsOptional()
  @IsString()
  agency?: string;

  @ApiProperty({
    type: MiCorreoAddressDto,
    description:
      'Dirección de entrega. Requerida para envíos a domicilio (deliveryType = D).',
  })
  @ValidateNested()
  @Type(() => MiCorreoAddressDto)
  address: MiCorreoAddressDto;

  @ApiProperty({
    example: 500,
    description: 'Valor declarado del envío.',
  })
  @IsNumber()
  declaredValue: number;

  @ApiProperty({
    example: 500,
    description: 'Peso del envío en gramos.',
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    example: 20,
    description: 'Alto del envío en centímetros.',
  })
  @IsNumber()
  height: number;

  @ApiProperty({
    example: 11,
    description: 'Ancho del envío en centímetros.',
  })
  @IsNumber()
  width: number;

  @ApiProperty({
    example: 8,
    description: 'Largo del envío en centímetros.',
  })
  @IsNumber()
  length: number;
}

export class ImportMiCorreoShipmentDto {
  @ApiProperty({
    description: 'Nro. de cuenta en Correo Argentino.',
    example: '00078945'
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({
    example: '777',
    description: 'Identificador externo de la orden.',
  })
  @IsString()
  @IsOptional()
  extOrderId?: string;

  @ApiPropertyOptional({
    example: '1221',
    description: 'Número de orden visible en MiCorreo.',
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({
    description: 'Información del remitente.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => MiCorreoSenderDto)
  sender?: MiCorreoSenderDto;

  @ApiProperty({
    description: 'Información del destinatario.',
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => MiCorreoRecipientDto)
  recipient: MiCorreoRecipientDto;

  @ApiProperty({
    type: MiCorreoShippingDto,
    description: 'Información del envío.',
  })
  @ValidateNested()
  @Type(() => MiCorreoShippingDto)
  shipping: MiCorreoShippingDto;
}