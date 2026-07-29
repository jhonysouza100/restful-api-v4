import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsModule } from '../emails/emails.module';
import { Order } from '../orders/entities/order.entity';
import { PaymentsModule } from '../payments/payments.module';
import { ProductsModule } from '../products/products.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), ProductsModule, PaymentsModule, ShipmentsModule, EmailsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
