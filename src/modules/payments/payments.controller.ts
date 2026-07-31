import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateMercadopagoPreferenceDto } from './dto/create-mercadopago-preference.dto';
import { MercadopagoPreferenceCreatedPayload } from './interfaces/mercadopago-preference-created.interface';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mercadopago/preference')
  @ApiOperation({ summary: 'Crear preferencia de pago en Mercado Pago', description: 'Crea una preferencia de pago en Mercado Pago con los productos investigados y la información de la empresa. Devuelve la respuesta de Mercado Pago con los detalles de la preferencia creada.' })
  @ApiBody({ description: 'Datos necesarios para crear una preferencia de pago en Mercado Pago, incluyendo los productos investigados y la información de la empresa.' })
  async createMercadopagoPreference(@Body() body: CreateMercadopagoPreferenceDto): Promise<MercadopagoPreferenceCreatedPayload> {
    try {
      return await this.paymentsService.createMercadopagoPreference(body);
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status)
    }
  }
}