import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UseTenantGuard } from '../../core/tenant/decorators/tenant.decorator';
import { Role } from '../../common/enums/roles.enum';
import { MercadopagoWebhookPayload } from '../payments/interfaces/mercadopago-webhook.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { FindOrdersQueryDto } from './dto/find-orders-query.dto';
import {
  UpdateOrderPaymentDto,
  UpdateOrderShipmentDto,
  UpdateOrderStatusDto,
} from './dto/update-order.dto';
import { OrdersService } from './orders.service';
import { UseRoleAuthToken } from '../../core/auth/decorators/auth.decorator';

/**
 * Recomendaciones para usuarios
 * Mostrar claramente quién modificó la orden y cuándo.
 * Pedir confirmación antes de cancelar o marcar como completada.
 * Evitar editar datos de pago manualmente salvo casos administrativos controlados.
 * Mantener visible una línea de tiempo del estado del pedido.
 */

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseRoleAuthToken()
  @ApiOperation({
    summary: 'Consultar órdenes',
    description:
      'Lista órdenes públicas aplicando filtros opcionales por tenant, orden, fecha y estado.',
  })
  @ApiOkResponse({
    description: 'Lista de órdenes que coincide con los filtros indicados.',
  })
  findOrders(@Query() query: FindOrdersQueryDto) {
    return this.ordersService.findOrders(query);
  }

  @Patch(':id/status')
  @UseRoleAuthToken(Role.ADMIN)
  @ApiParam({ name: 'id', description: 'Identificador de la orden', type: Number })
  @ApiOperation({ summary: 'Actualizar el estado de una orden' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, data);
  }

  @Patch(':id/shipment')
  @UseRoleAuthToken(Role.ADMIN)
  @ApiParam({ name: 'id', description: 'Identificador de la orden', type: Number })
  @ApiOperation({ summary: 'Actualizar los datos de envío de una orden' })
  updateOrderShipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrderShipmentDto,
  ) {
    return this.ordersService.updateOrderShipment(id, data);
  }

  @Patch(':id/payment')
  @UseRoleAuthToken(Role.ADMIN)
  @ApiParam({ name: 'id', description: 'Identificador de la orden', type: Number })
  @ApiOperation({ summary: 'Actualizar los datos de pago de una orden' })
  updateOrderPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrderPaymentDto,
  ) {
    return this.ordersService.updateOrderPayment(id, data);
  }

  @Post()
  @UseTenantGuard()
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key (optional if using domain)',
    required: false,
  })
  @ApiOperation({
    summary: 'Crear una nueva orden',
    description:
      'Crea una nueva orden en el sistema con los items de un carrito.',
  })
  @ApiBody({
    type: CreateOrderDto,
    description:
      'Datos para crear una nueva orden de compra con los items de un carrito.',
  })
  createOrder(@Body() orderData: CreateOrderDto) {
    try {
      return this.ordersService.createOrder(orderData);
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }

  // Webhooks de confirmacion de pago
  @Post('confirm/mercadopago')
  @ApiOperation({
    summary: 'Receptor de notificaciones de mercado Pago',
    description:
      'Las notificaciones se enviarán cada vez que se cree un pago o se modifique su estado. En el campo notification_url, indica la URL desde la que se recibirán las notificaciones.',
  })
  @ApiOkResponse({
    description:
      'Mercadopago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).',
  })
  @ApiBody({
    type: MercadopagoWebhookPayload,
    description:
      'La notificación será enviada con formato JSON atraves de la plataforma de Mercado Pago',
  })
  confirmPayment(@Body() notification: any) {
    try {
      return this.ordersService.confirmMercadopagoPayment(notification);
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }
}
