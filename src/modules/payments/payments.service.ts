import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from '../../common/config/env.config';
import { CreateMercadopagoPreferenceDto } from './dto/create-mercadopago-preference.dto';
import { MercadoPagoPayment } from './interfaces/mercadopago-payment.interface';
import { MercadopagoPreferenceCreatedPayload } from './interfaces/mercadopago-preference-created.interface';
import { CreateMercadopagoPreferenceInterface } from './interfaces/mercadopago-preference.interface';

@Injectable()
export class PaymentsService {

  async createMercadopagoPreference(data: CreateMercadopagoPreferenceDto): Promise<MercadopagoPreferenceCreatedPayload> {
    // Se monta el cuerpo de la preferencia a enviar a la API de Mercado Pago
    const createMercadopagoPreferencePayload: CreateMercadopagoPreferenceInterface = {
      items: data?.items?.map((el) => ({
        id: el.id.toString(),
        title: el.title,
        quantity: Number(el.quantity),
        unit_price: el.price_with_discounts,
        currency_id: "ARS",
        category_id: el.category,
        description: el.description,
        picture_url: el.picture_url,
      })),
      auto_return: "approved",
      back_urls: {
        success: `${data.back_urls?.success || `${data.tenant.domain}/payment/success`}`,
        failure: `${data.back_urls?.failure || `${data.tenant.domain}/payment/failure`}`,
        pending: `${data.back_urls?.pending || `${data.tenant.domain}/payment/pending`}`,
      },
      // external_reference: data.order_id.toString(),
      external_reference: data.order_id.toString(),
      notification_url: `${env.SERVER_URL}/api/v1/orders/confirm/mercadopago`,
      statement_descriptor: `${data.tenant.company}`,
      payment_methods: {
        excluded_payment_types: data.payment_methods?.excluded_payment_types,
        excluded_payment_methods: data.payment_methods?.excluded_payment_methods,
        installments: data.payment_methods?.installments,
        default_payment_method_id: data.payment_methods?.default_payment_method_id,
      }
    }

    try {
      // Crear la preferencia en Mercadopago
      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.tenant.private_key}`,
          "Content-Type": "application/json",
          // Integrator Id
          "x-integrator-id": "dev_24c65fb163bf11ea96500242ac130004",
        },
        body: JSON.stringify(createMercadopagoPreferencePayload),
      })

      const MercadopagoResponseInterface: MercadopagoPreferenceCreatedPayload = await response.json();
      return MercadopagoResponseInterface;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';

      // Error en la comunicación con MercadoPago
      throw new HttpException(
        `Error de comunicación con MercadoPago: ${message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  async getMercadopagoPaymentById(data: { id?: string, authorization?: string }): Promise<MercadoPagoPayment> {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data.authorization}`
        }
      })

      return await response.json();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';

      // Error en la comunicación con MercadoPago
      throw new HttpException(
        `Error de comunicación con MercadoPago: ${message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }
}