import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from '../../common/config/env.config';
import { CreateMercadopagoPreferenceDto } from './dto/create-mercadopago-preference.dto';
import { CreateMercadopagoPreferenceInterface } from './interfaces/create-mercadopago.interface';
import { MercadopagoResponse } from './interfaces/mercadopago-response.interface';

@Injectable()
export class PaymentsService {
  
  async createMercadopagoPreference(data: CreateMercadopagoPreferenceDto): Promise<MercadopagoResponse> {
    // Se monta el cuerpo de la preferencia a enviar a la API de Mercado Pago
    const createMercadopagoPreferencePayload: CreateMercadopagoPreferenceInterface = {
      items: data.items.map((el) => ({
        title: el.title,
        quantity: Number(el.quantity),
        unit_price: el.price_with_discounts,
        category_id: el.category,
        description: el.description
      })),
      auto_return: "approved",
      back_urls: {
        success: `${data.back_urls?.success || `${data.tenant.domain}/payment/success`}`,
        failure: `${data.back_urls?.failure || `${data.tenant.domain}/payment/failure`}`,
        pending: `${data.back_urls?.pending || `${data.tenant.domain}/payment/pending`}`,
      },
      external_reference: data.order_id.toString(),
      notification_url: `${env.SERVER_URL}/api/v1/payments/mercadopago/confirm`,
      statement_descriptor: `${data.tenant.company}`,
    }

    try {
    // Crear la preferencia en Mercadopago
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.tenant.private_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createMercadopagoPreferencePayload),
      })

      const mercadopagoResponse: MercadopagoResponse = await response.json();

      return mercadopagoResponse;
    } catch (error) {
      // Error en la comunicación con MercadoPago
      throw new HttpException(
        `Error de comunicación con MercadoPago: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  async confirmPayment(notification: any) {
    // Luego de responder la notificación, confirmando su recibimiento, puedes obtener toda la información sobre el evento del tópico payments notificado haciendo un GET al endpoint v1/payments/{id}.
    // https://api.mercadopago.com/v1/payments/{id}
    console.log("mercadopago: ", notification);
    /**
     * mercadopago:  {
        action: 'payment.updated',
        api_version: 'v1',
        data: { id: '123456' },
        date_created: '2021-11-01T02:02:02Z',
        id: '123456',
        live_mode: false,
        type: 'payment',
        user_id: 280626182
      }
    */

    // Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).
    return new HttpException('Notificación recibida correctamente', HttpStatus.OK);
  }
}