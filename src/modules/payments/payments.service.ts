import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMercadopagoDto } from './dto/create-mercadopago.dto';
import { MercadopagoResponse } from './interfaces/mercadopago-response.interface';
import { env } from '../../common/config/env.config';

interface ProductResearched {
  id?: string;
  title: string;
  quantity: number;
  price: number;
  discount?: number;
  description?: string;
  category: string;
  coupon: number;
}

@Injectable()
export class PaymentsService {

  async createMercadopagoPreference(data: ProductResearched[], tenancy: { api_key: string, domain: string, company: string }): Promise<MercadopagoResponse> {
    // Se monta el cuerpo de la preferencia a enviar a la API de Mercado Pago
    const newPreference: CreateMercadopagoDto = {
      items: data.map((el) => ({
        title: el.title,
        quantity: Number(el.quantity),
        unit_price: Number(el.price) - (Number(el.price) * Number((el?.discount || 0) + el.coupon || 0)) / 100,
        id: el.id,
        category_id: el.category,
        description: el.description,
      })),
      auto_return: "approved",
      back_urls: {
        success: `${tenancy.domain}/payment/success`,
        failure: `${tenancy.domain}/payment/failure`,
        pending: `${tenancy.domain}/payment/pending`,
      },
      notification_url: `${env.SERVER_URL}/api/v1/payments/mercadopago/confirm`,
      statement_descriptor: `${tenancy.company}`,
    }

    try {
    // Crear la preferencia en Mercadopago
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tenancy.api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPreference),
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

  async confirmPayment(notification: MercadopagoResponse) {
    // Luego de responder la notificación, confirmando su recibimiento, puedes obtener toda la información sobre el evento del tópico payments notificado haciendo un GET al endpoint v1/payments/{id}.
    // https://api.mercadopago.com/v1/payments/{id}
    console.log("mercadopago: ", notification)

    // Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).
    return new HttpException('Notificación recibida correctamente', HttpStatus.OK);
  }
}