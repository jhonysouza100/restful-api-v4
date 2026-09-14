import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { OrderStatusEnum } from '../enum/order-status.enum';

export class FindOrdersQueryDto {
  @ApiPropertyOptional({
    description: 'Identificador de la orden',
    example: 25,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  order_id?: number;

  @ApiPropertyOptional({
    description: 'Número de página, comenzando en 1',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de órdenes por página, entre 1 y 100',
    example: 20,
    default: 20,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 6;

  @ApiPropertyOptional({
    description: 'Precio total mínimo de la orden, inclusive',
    example: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiPropertyOptional({
    description: 'Precio total máximo de la orden, inclusive',
    example: 5000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiPropertyOptional({
    description: 'Fecha inicial inclusiva en formato ISO 8601',
    example: '2026-09-01',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Fecha final inclusiva en formato ISO 8601',
    example: '2026-09-14',
  })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({
    description: 'Estado de la orden',
    enum: OrderStatusEnum,
  })
  @IsOptional()
  @IsEnum(OrderStatusEnum)
  status?: OrderStatusEnum;
}
