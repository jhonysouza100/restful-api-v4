import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { MercadopagoResponse } from './interfaces/mercadopago-response.interface';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercadopago/confirm')
  @ApiOperation({ summary: 'Receptor de notificaciones de mercado Pago', description: 'Las notificaciones se enviarán cada vez que se cree un pago o se modifique su estado (Pendiente, Rechazado o Aprobado). En el campo notification_url, indica la URL desde la que se recibirán las notificaciones.' })
  @ApiOkResponse({
    description: 'Mercadopago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).',
  })
  @ApiBody({ type: MercadopagoResponse, description: 'La notificación será enviada con formato JSON atraves de la plataforma de Mercado Pago' })
  confirmPayment(@Body() notification: MercadopagoResponse) {
    try {
      return this.paymentsService.confirmPayment(notification)
    } catch (error) {
      return error.message
    }
  }

  @Post('mercadopago/preference')
  @ApiOperation({ summary: 'Crear preferencia de pago en Mercado Pago', description: 'Crea una preferencia de pago en Mercado Pago con los productos investigados y la información de la empresa. Devuelve la respuesta de Mercado Pago con los detalles de la preferencia creada.' })
  @ApiBody({ description: 'Datos necesarios para crear una preferencia de pago en Mercado Pago, incluyendo los productos investigados y la información de la empresa.' })
  async createMercadopagoPreference(@Body() body: { products: any[], tenancy: { api_key: string, domain: string, company: string } }): Promise<MercadopagoResponse> {
    try {
      return await this.paymentsService.createMercadopagoPreference(body.products, body.tenancy);
    } catch (error) {
      throw new Error(`Error al crear la preferencia de pago en Mercado Pago: ${error.message}`);
    }
  }
}