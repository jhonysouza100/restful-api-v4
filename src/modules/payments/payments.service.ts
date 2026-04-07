import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from '../../common/config/env.config';
import { CreateMercadopagoPreferenceDto } from './dto/create-mercadopago-preference.dto';
import { CreateMercadopagoPreferenceInterface } from './interfaces/mercadopago-preference.interface';
import { MercadopagoResponseInterface } from './interfaces/mercadopago-response.interface';

@Injectable()
export class PaymentsService {
  
  async createMercadopagoPreference(data: CreateMercadopagoPreferenceDto): Promise<MercadopagoResponseInterface> {
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

      const MercadopagoResponseInterface: MercadopagoResponseInterface = await response.json();

      return MercadopagoResponseInterface;
    } catch (error) {
      // Error en la comunicación con MercadoPago
      throw new HttpException(
        `Error de comunicación con MercadoPago: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }
  }

  async confirmMercadopagoPayment(notification: any) {
    // COMMIT feat: add Mercado Pago payment and preference interfaces, update payment service with detailed payment confirmation handling
    console.log("mercadopago: ", notification);

    /** Lo que se recibe si el pago fue creado exitosamente: En este caso, el pago fue creado exitosamente, por lo que el ID que se recibe en data.id corresponde al ID del pago. Con ese ID, puedes hacer un GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token} para obtener toda la información sobre ese pago. (Lease ref 1).
     * {
        action: 'payment.created',
        api_version: 'v1',
        data: { id: '152598828503' },
        date_created: '2026-04-05T08:22:08Z',
        id: 130425051313,
        live_mode: true,
        type: 'payment',
        user_id: '251743149
        }
    */

    /** Lo que se recibe si hubo un Error de pago: En este caso, el hubo un error de pago, por lo que el ID que se recibe en data.id corresponde al ID del pago. Con ese ID, puedes hacer un GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token} para obtener toda la información sobre ese pago.
      
      {
        resource: 'https://api.mercadolibre.com/merchant_orders/152598828503',
        topic: 'merchant_order'
      }
    */

    /** Ref 1: Lo que se recibe si el pago fue aprobado exitosamente: En este caso, el pago fue aprobado exitosamente, por lo que el ID que se recibe en data.id corresponde al ID del pago. Con ese ID, puedes hacer un GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token} para obtener toda la información sobre ese pago.
      {
        "accounts_info": null,
        "acquirer_reconciliation": [],
        "additional_info": {
          "ip_address": "181.239.173.25",
          "items": [
            {
              "category_id": "PRUEBAS SDK",
              "description": "Esta es la descripcion del producto para pruebas de MP SDK en entorno real",
              "quantity": "1",
              "title": "Producto para pruebas de MP",
              "unit_price": "100"
            }
          ],
          "tracking_id": "platform:v1-blacklabel,so:ALL,type:N/A,security:none"
        },
        "authorization_code": null,
        "binary_mode": false,
        "brand_id": null,
        "build_version": "3.150.0-rc-6",
        "call_for_authorize_id": null,
        "captured": true,
        "card": {},
        "charges_details": [
          {
            "accounts": {
              "from": "collector",
              "to": "mp"
            },
            "amounts": {
              "original": 4.1,
              "refunded": 0
            },
            "base_amount": 100,
            "client_id": 0,
            "date_created": "2026-04-05T04:22:08.000-04:00",
            "external_charge_id": "01KNEBRAQH2GC1T0FB80P5WD3B",
            "id": "152598828503-001",
            "last_updated": "2026-04-05T04:22:08.000-04:00",
            "metadata": {
              "reason": "",
              "source": "proc-svc-charges",
              "source_detail": "processing_fee_charge"
            },
            "name": "mercadopago_fee",
            "rate": 4.1,
            "refund_charges": [],
            "reserve_id": null,
            "type": "fee",
            "update_charges": []
          }
        ],
        "charges_execution_info": {
          "internal_execution": {
            "date": "2026-04-05T04:22:08.900-04:00",
            "execution_id": "01KNEBRAPSM7WH9AJ01H19WP2B"
          }
        },
        "collector_id": 2517431499,
        "corporation_id": null,
        "counter_currency": null,
        "coupon_amount": 0,
        "currency_id": "ARS",
        "date_approved": "2026-04-05T04:22:09.000-04:00",
        "date_created": "2026-04-05T04:22:08.000-04:00",
        "date_last_updated": "2026-04-05T04:22:14.000-04:00",
        "date_of_expiration": null,
        "deduction_schema": null,
        "description": "Producto para pruebas de MP",
        "differential_pricing_id": null,
        "external_reference": "666",
        "fee_details": [
          {
            "amount": 4.1,
            "fee_payer": "collector",
            "type": "mercadopago_fee"
          }
        ],
        "financing_group": null,
        "id": 152598828503,
        "installments": 1,
        "integrator_id": null,
        "issuer_id": "2005",
        "live_mode": true,
        "marketplace_owner": null,
        "merchant_account_id": null,
        "merchant_number": null,
        "metadata": {},
        "money_release_date": "2026-04-23T04:22:09.000-04:00",
        "money_release_schema": null,
        "money_release_status": "pending",
        "notification_url": "https://restful-api-v4.vercel.app/api/v1/payments/mercadopago/confirm",
        "operation_type": "regular_payment",
        "order": {
          "id": "39657060047",
          "type": "mercadopago"
        },
        "payer": {
          "email": "test_user_1814828248@testuser.com",
          "entity_type": null,
          "first_name": null,
          "id": "2517440931",
          "identification": {
            "number": "1111111",
            "type": "DNI"
          },
          "last_name": null,
          "operator_id": null,
          "phone": {
            "number": null,
            "extension": null,
            "area_code": null
          },
          "type": null
        },
        "payment_method": {
          "id": "account_money",
          "issuer_id": "2005",
          "type": "account_money"
        },
        "payment_method_id": "account_money",
        "payment_type_id": "account_money",
        "platform_id": null,
        "point_of_interaction": {
          "application_data": {
            "name": "checkout-off",
            "operating_system": null,
            "version": "v2"
          },
          "business_info": {
            "branch": "Merchant Services",
            "sub_unit": "checkout_pro",
            "unit": "online_payments"
          },
          "location": {
            "source": "Collector",
            "state_id": "NN"
          },
          "transaction_data": {
            "e2e_id": null
          },
          "type": "CHECKOUT"
        },
        "pos_id": null,
        "processing_mode": "aggregator",
        "refunds": [],
        "release_info": null,
        "shipping_amount": 0,
        "sponsor_id": null,
        "statement_descriptor": null,
        "status": "approved",
        "status_detail": "accredited",
        "store_id": null,
        "tags": null,
        "taxes_amount": 0,
        "transaction_amount": 100,
        "transaction_amount_refunded": 0,
        "transaction_details": {
          "acquirer_reference": null,
          "external_resource_url": null,
          "financial_institution": null,
          "installment_amount": 0,
          "net_received_amount": 95.9,
          "overpaid_amount": 0,
          "payable_deferral_period": null,
          "payment_method_reference_id": null,
          "total_paid_amount": 100
        }
      }
        
    * O en caso de error de autenticación en GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token}:
      {
        "cause": [
          {
            "Code": "invalid_caller_id",
            "Message": "Invalid caller_id"
          }
        ],
        "code": "invalid_caller_id",
        "error": "authorization",
        "message": "Invalid caller_id",
        "status": 401
      }
     */
    
    // Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).
    return new HttpException('Notificación recibida correctamente', HttpStatus.OK);
  }
}