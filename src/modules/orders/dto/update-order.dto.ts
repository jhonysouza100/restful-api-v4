import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { OrderStatusEnum } from '../enum/order-status.enum';
import { CreateOrderPaymentDto, CreateOrderShipmentDto } from './create-order.dto';

export class UpdateOrderShipmentDto extends PartialType(CreateOrderShipmentDto) {}

export class UpdateOrderPaymentDto extends PartialType(CreateOrderPaymentDto) {}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'Nuevo estado de la orden.', enum: OrderStatusEnum })
  @IsEnum(OrderStatusEnum)
  status: OrderStatusEnum;
}
