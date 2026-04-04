import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  Min,
  IsPositive,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

class MercadopagoItemDto {
  @ApiProperty({ example: 1, description: 'ID del producto' })
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({ example: 'Camiseta', description: 'Nombre/titulo del producto' })
  @IsString()
  title: string;

  @ApiProperty({ example: 2, description: 'Cantidad pedida' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: 199.99,
    description:
      'Precio unitario ya con descuentos aplicados. Debe calcularse al crear la orden.',
  })
  @IsNumber()
  @Min(0)
  /**
   * El precio unitario debe ser calculado durante la creacion de la orden
   * unit_price: Number(el.price) - (Number(el.price) * Number((el?.discount || 0) + el.coupon || 0)) / 100,
  */
  price_with_discounts: number;

  @ApiProperty({ example: 'Alguna descripcion', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'clothing', description: 'Categoria del producto' })
  @IsString()
  category: string;
}

class TenantDto {
  @ApiProperty({
    example: 'TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description:
      'Private API Key de Mercado Pago (usar variables de entorno en producción).',
  })
  @IsString()
  private_key: string;

  @ApiProperty({ example: 'mycompany.com', description: 'Dominio de la empresa' })
  @IsString()
  domain: string;

  @ApiProperty({ example: 'My Company', description: 'Nombre de la empresa' })
  @IsString()
  company: string;
}

class BackUrlsDto {
  @ApiProperty({ example: 'https://miapp.com/success' })
  @IsString()
  @IsUrl()
  success: string;

  @ApiProperty({ example: 'https://miapp.com/failure' })
  @IsString()
  @IsUrl()
  failure: string;

  @ApiProperty({ example: 'https://miapp.com/pending' })
  @IsString()
  @IsUrl()
  pending: string;
}

export class CreateMercadopagoPreferenceDto {
  @ApiProperty({
    type: [MercadopagoItemDto],
    description:
      'Listado de items (producto procesado por el módulo de productos/ordenes) con precio ya con descuentos aplicados.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MercadopagoItemDto)
  items: MercadopagoItemDto[];

  @ApiProperty({ type: TenantDto, description: 'Información de la empresa / tenancy' })
  @ValidateNested()
  @Type(() => TenantDto)
  tenant: TenantDto;

  @ApiProperty({ example: 1234, description: 'ID interno de la orden' })
  @IsNumber()
  @IsPositive()
  order_id: number;

  @ApiProperty({ type: BackUrlsDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackUrlsDto)
  back_urls?: BackUrlsDto;
}