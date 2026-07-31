import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UseTenantGuard } from '../../core/tenant/decorators/tenant.decorator';
import { MercadopagoWebhookPayload } from '../payments/interfaces/mercadopago-webhook.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  @ApiOperation({ summary: 'Crear una nueva orden', description: 'Crea una nueva orden en el sistema con los items de un carrito.' })
  @ApiBody({ type: CreateOrderDto, description: 'Datos para crear una nueva orden de compra con los items de un carrito.' })
  async createOrder(@Body() orderData: CreateOrderDto) {
    try {
      return await this.ordersService.createOrder(orderData);
    } catch (error: any) {
      throw new Error(`${error.message}`, { cause: error.status })
    }
  }

  // Webhooks de confirmacion de pago
  @Post('confirm/mercadopago')
  @ApiOperation({ summary: 'Receptor de notificaciones de mercado Pago', description: 'Las notificaciones se enviarán cada vez que se cree un pago o se modifique su estado. En el campo notification_url, indica la URL desde la que se recibirán las notificaciones.' })
  @ApiOkResponse({
    description: 'Mercadopago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).',
  })
  @ApiBody({ type: MercadopagoWebhookPayload, description: 'La notificación será enviada con formato JSON atraves de la plataforma de Mercado Pago' })
  confirmPayment(@Body() notification: any) {
    try {
      return this.ordersService.confirmMercadopagoPayment(notification)
    } catch (error: any) {
      throw new Error(`${error.message}`, { cause: error.status })
    }
  }
}