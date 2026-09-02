import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { env } from '../../common/config/env.config';
import { TenantContextService } from '../../core/tenant/tenant.context';
import { TenantsService } from '../../core/tenant/tenants.service';
import { SendEmailDto } from '../emails/dtos/send-mail.dto';
import { EmailsService } from '../emails/emails.service';
import { CreateOrderDto, CreateOrderShipmentDto, CretateOrderItemsDto } from '../orders/dto/create-order.dto';
import { Order } from '../orders/entities/order.entity';
import { OrderItemInterface } from '../orders/interfaces/order-item.interface';
import { CreateMercadopagoPreferenceDto } from '../payments/dto/create-mercadopago-preference.dto';
import { MercadopagoWebhookAction } from '../payments/enum/mercadopago-webhook-action.enum';
import { MercadoPagoPaymentStatusDetailEnum } from '../payments/interfaces/mercadopago-payment.interface';
import { MercadopagoWebhookPayload } from '../payments/interfaces/mercadopago-webhook.interface';
import { PaymentsService } from '../payments/payments.service';
import { ProductCategoryEnum } from '../products/enums/products.enum';
import { ProductsService } from '../products/products.service';
import { ImportMiCorreoShipmentDto } from '../shipments/dto/import-micorreo-shipment.dto';
import { AgencyIconEnum } from '../shipments/enum/agency-icon.enum';
import { ShipmentsService } from '../shipments/shipments.service';
import { OrderStatusEnum } from './enum/order-status.enum';
import { OrderTopicEnum } from './enum/order-topic.enum';
import { OrderInterface } from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    private readonly productsService: ProductsService,
    private readonly paymentsService: PaymentsService,
    private readonly tenantContextService: TenantContextService,
    private readonly tenantService: TenantsService,
    private readonly shipmentService: ShipmentsService,
    private readonly emailsService: EmailsService
  ) { }

  async createOrder(data: CreateOrderDto) {
    // Validar que data existe y tiene la estructura correcta
    if (!data) {
      throw new HttpException("Los datos de la orden son requeridos", HttpStatus.BAD_REQUEST)
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new HttpException("La orden debe contener al menos un item", HttpStatus.BAD_REQUEST)
    }

    let couponFound: { code: string; discount: number } | null = { code: "code", discount: 0 }; // Type Coupon

    /**
     *  let couponFound: Coupon | null;
        // Buscar el descuento de un cupon por su code: "code", si se proporciona desde el cliente
        if (data.coupon && typeof data.coupon === "string" && data.coupon.trim() !== "") {
          try {
            couponFound = await this.couponsService.findAndAppliDiscountCoupon(data.coupon.trim())
          } catch (error) {
            // Si el cupón no es válido, continuar sin cupón
            couponFound = null
          }
        }
     */

    // Espera a que todas las promesas se resuelvan
    const productsList: OrderItemInterface[] = await Promise.all(
      data.items.map(async (el) => {
        try {
          // Busca y valida si un producto esta activo y/o posee stock y verifica la tenencia
          const tenantId = this.tenantContextService.getTenantId();
          const productFound = await this.productsService.validateProductForSale(el.item_id, el.quantity, tenantId);

          // Devuelve un "item" (para crear una nueva "order") con los datos de un producto buscado en la database
          return {
            item_id: productFound.id,
            name: productFound.name,
            quantity: el.quantity,
            price: productFound.price,
            discount: productFound.discount || 0,
            subtotal: (Number(productFound.price) * (1 - Number(productFound.discount) / 100)),
            image_url: productFound?.images?.at(0)?.secure_url
          }

        } catch (error: any) {
          throw new HttpException(error.message, HttpStatus.CONFLICT);
        }
      })
    )

    const subtotal = this.calculateItemsTotal(productsList);

    const newOrderPayload: OrderInterface = {
      // coupon: { code: couponFound?.code || null, discount: couponFound?.discount || null },
      items: [...productsList],
      tenant_id: this.tenantContextService.getTenantId(),
      user_id: data?.user_id || 0,
      subtotal: subtotal,
      total: Number(subtotal) - (Number(subtotal) * Number(couponFound?.discount || 0) / 100)
    }

    const createdOrder = this.ordersRepo.create(newOrderPayload);
    const savedOrder = await this.ordersRepo.save(createdOrder);

    if (!savedOrder) {
      throw new HttpException('No se pudo crear la orden', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    // Se monta el cuerpo de la preferencia a enviar a la API de Mercado Pago
    const newPreferencePayload: CreateMercadopagoPreferenceDto = {
      items: savedOrder?.items?.map((el) => ({
        id: el.item_id,
        title: el.name,
        quantity: Number(el.quantity),
        price_with_discounts: el.subtotal,
        picture_url: el?.image_url,
      })),
      order_id: savedOrder.id,
      tenant: {
        company: this.tenantContextService.getTenantCompany(),
        private_key: this.tenantContextService.getTanantMercadopago(),
        domain: this.tenantContextService.getTenantDomain()
      }
    }

    // Si hay datos de envio. Hay veces que se crea una orden donde no se incluyen los datos de envio.
    let dimensionsData;
    let shipmentCost;
    if (data.shipment) {
      // Se calcula el envío y las dimensiones del paquete.
      const { dimensions, rate } = await this.getTotalShipmentCost(data.items, data.shipment);

      dimensionsData = dimensions;
      shipmentCost = rate;

      // Se agrega el costo de envío, como item a la preferencia MercadoPago.
      newPreferencePayload.items?.push({
        title: "Costo de Envío",
        id: 0,
        price_with_discounts: rate,
        quantity: 1,
        category: ProductCategoryEnum.OTHER,
        picture_url: AgencyIconEnum.CORREOARGENTINO,
        description: "Costo de envío por Correo Argentino"
      });
    }

    // se crea la preferencia en MercadoPago
    const createdPreference = await this.paymentsService.createMercadopagoPreference(newPreferencePayload);

    // Se actualizan los datos de pago en la orden
    const paymentData = {
      preference_id: createdPreference.id,
      method: data.payment?.method,
      payment_url: createdPreference.init_point
    };

    const shipmentdata = {
      ...data.shipment,
      dimensions: dimensionsData,
      shipment_cost: shipmentCost
    }

    await this.ordersRepo.update(
      { id: savedOrder.id },
      {
        ...savedOrder,
        payment: paymentData,
        shipment: shipmentdata
      }
    );

    return await this.ordersRepo.findOne({ where: { id: savedOrder.id } });
  }

  // Webhooks de confirmacion de pago
  async confirmMercadopagoPayment(payload: MercadopagoWebhookPayload) {
    // console.log("payload: ", payload)
    /** Lo que se recibe si el pago fue creado exitosamente: En este caso, el pago fue creado exitosamente, por lo que el ID que se recibe en data.id corresponde al ID del pago. Con ese ID, puedes hacer un GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token} para obtener toda la información sobre ese pago. (Lease ref 1).
     {
        action: 'payment.created', 'payment.updated'
        api_version: 'v1',
        data: { id: '152598828503' },
        date_created: '2026-04-05T08:22:08Z',
        id: 130425051313,
        live_mode: true,
        type: 'payment',
        user_id: '251743149'
      }
    */

    /** Lo que se recibe si hubo un Error de pago: En este caso, el hubo un error de pago, por lo que el ID que se recibe en data.id corresponde al ID del pago. Con ese ID, puedes hacer un GET a https://api.mercadolibre.com/v1/payments/{id} Header Authorization: Bearer {token} para obtener toda la información sobre ese pago.
      
      {
        resource: 'https://api.mercadolibre.com/merchant_orders/152598828503',
        topic: 'merchant_order'
      }
      
      {
        resource: '169829829543',
        topic: 'payment' 
      }
    */

    if (payload.data?.id) {
      const tenantSearched = await this.tenantService.findByMercadopagoUserId(payload?.user_id);
      const preferenceSearched = await this.paymentsService.getMercadopagoPaymentById({
        id: payload.data.id,
        authorization: tenantSearched?.private_keys.mercadopago
      })
      const orderSearched = await this.ordersRepo.findOne({ where: { id: parseInt(preferenceSearched.external_reference) } })

      if (payload.action === MercadopagoWebhookAction.PAYMENT_UPDATED) {
        if (orderSearched?.payment) {
          // Se actualiza los datos del pago en la orden.
          orderSearched.payment.status = preferenceSearched.status;
          orderSearched.payment.status_detail = preferenceSearched.status_detail;
          // Se actualiza el estado de la orden.
          if (preferenceSearched.status_detail === MercadoPagoPaymentStatusDetailEnum.PENDING) orderSearched.status = OrderStatusEnum.PENDING;
          if (preferenceSearched.status_detail === MercadoPagoPaymentStatusDetailEnum.CANCELLED) orderSearched.status = OrderStatusEnum.CANCELLED;
          // Se guarda la orden actualizada.
          await this.ordersRepo.update({ id: orderSearched.id }, orderSearched);
          // Se restaura el inventario por cadaa item.
          await this.productsService.restoreCancelledProduct(orderSearched?.items);
          await this.notifyOrderByEmail({
            from: `${tenantSearched?.company}`,
            to: tenantSearched?.email as string,
            topic: `${OrderTopicEnum.PAGO_PENDIENTE}`,
            order: orderSearched
          });
        }
      }

      if (payload.action === MercadopagoWebhookAction.PAYMENT_CREATED) {
        if (orderSearched && orderSearched.payment?.status_detail !== MercadoPagoPaymentStatusDetailEnum.ACCREDITED) {
          // Se actúaliza los datos del pago en la orden.
          if (orderSearched.payment) {
            orderSearched.payment.payment_id = String(payload.data.id);
            orderSearched.payment.status = preferenceSearched.status;
            orderSearched.payment.status_detail = preferenceSearched.status_detail;
          }

          // Se crea el payload para el envío.
          if (orderSearched.shipment) {
            const data: ImportMiCorreoShipmentDto = {
              customerId: tenantSearched?.private_keys.correo_argentino?.customer_id,
              extOrderId: orderSearched.id.toString(),
              orderNumber: orderSearched.id.toString(),
              sender: {
                name: tenantSearched?.fullName || ""
              },
              recipient: {
                name: orderSearched.shipment.fullName || "",
                phone: orderSearched.shipment.phone || "",
                email: orderSearched.shipment.email || "",
                cellPhone: orderSearched.shipment.phone || ""
              },
              shipping: {
                deliveryType: orderSearched.shipment.deliveredType || "",
                agency: orderSearched.shipment.pickupLocation || "",
                address: {
                  streetName: orderSearched.shipment.streetName || "",
                  streetNumber: orderSearched.shipment.streetNumber || "",
                  city: orderSearched.shipment.city || "",
                  provinceCode: orderSearched.shipment.provinceCode || "",
                  postalCode: orderSearched.shipment.postalCodeDestination || ""
                },
                ...orderSearched.shipment.dimensions
              }
            }
            // Se importa el envío a la plataforma de MiCorreo.
            await this.shipmentService.importMiCorreoShipment(data, {
              user: tenantSearched?.private_keys.correo_argentino?.user,
              password: tenantSearched?.private_keys.correo_argentino?.password,
              customer_id: tenantSearched?.private_keys.correo_argentino?.customer_id
            });
          }
          // Se actualiza el estado de la orden.
          orderSearched.status = OrderStatusEnum.ACCREDITED;
          // Se guarda la orden actualizada.
          await this.ordersRepo.update({ id: orderSearched.id }, orderSearched);
          // Se descuenta el inventario por cada item.
          await this.productsService.subtractSoldProduct(orderSearched?.items);

          await this.notifyOrderByEmail({
            from: `${tenantSearched?.company}`,
            to: tenantSearched?.email as string,
            topic: `${OrderTopicEnum.NUEVA_VENTA}`,
            order: orderSearched
          });

          await this.notificationCustomerByEmail({
            user: { email: tenantSearched?.email as string, pass: tenantSearched?.private_keys.smtp as string },
            from: `${tenantSearched?.company}`,
            to: orderSearched.shipment?.email || "",
            topic: `${OrderTopicEnum.PAGO_APROBADO}`,
            order: orderSearched
          })
        }
      }
    }

    // Mercado Pago espera una respuesta para validar que esa recepción fue correcta. Para eso, debes devolver un HTTP STATUS 200 (OK) o 201 (CREATED).
    throw new HttpException('Notificación recibida correctamente', HttpStatus.OK);
  }

  // Funci{on auxiliar para calcular el total de un carrito
  private calculateItemsTotal(items: OrderItemInterface[]): number {
    return items.reduce((acc, el) => acc + (el.subtotal * el.quantity), 0);
  }

  // Función auxiliar para calcular las dimenciónes y el total del envio
  private async getTotalShipmentCost(items: CretateOrderItemsDto[], shipmentData: CreateOrderShipmentDto): Promise<{
    rate: number,
    dimensions: { height: number, length: number, width: number, weight: number, declaredValue: number }
  }> {
    if (!items.length) return { rate: 0, dimensions: { height: 0, length: 0, weight: 0, width: 0, declaredValue: 0 } };


    const calculateVolume = async (): Promise<{
      width: number;
      height: number;
      length: number;
      weight: number;
      declaredValue: number;
    }> => {
      const productsWithQty = await Promise.all(
        items.map(async (item) => {
          const productFound = await this.productsService.findOne(item.item_id);
          return {
            productFound,
            quantity: item.quantity
          }
        })
      )
      const dimensions = productsWithQty.reduce((acc, el) => {
        const product = el.productFound;
        const qty = el.quantity ?? 0;

        const width = product?.dimensions?.width ?? 0;
        const height = product?.dimensions?.height ?? 0;
        const length = product?.dimensions?.length ?? 0;
        const weight = product?.dimensions?.weight ?? 0;
        const price = Number(product?.price ?? 0);

        // Volumen de una unidad
        const volume = width * height * length;

        return {
          totalVolume: acc.totalVolume + (volume * qty),
          weight: acc.weight + (weight * qty),
          declaredValue: acc.declaredValue + (price * qty),
        };
      }, {
        totalVolume: 0,
        weight: 0,
        declaredValue: 0,
      });

      // Lado del cubo equivalente
      const cubeSide = Math.ceil(Math.cbrt(dimensions.totalVolume));

      return {
        width: cubeSide,
        height: cubeSide,
        length: cubeSide,
        weight: dimensions.weight,
        declaredValue: dimensions.declaredValue,
      };
    };

    const shipmentDimensions = await calculateVolume();

    const shipmentCost = await this.shipmentService.getMiCorreoRates({
      dimensions: {
        height: shipmentDimensions.height,
        weight: shipmentDimensions.weight,
        width: Math.ceil(shipmentDimensions.width),
        length: shipmentDimensions.length
      },
      postalCodeDestination: shipmentData.postalCodeDestination,
      deliveredType: shipmentData.deliveredType,
    });

    const deliveryType = shipmentData.deliveredType?.toUpperCase() ?? 'D';
    const shipmentRate = shipmentCost?.rates?.find((rate) => {
      return rate.deliveredType === deliveryType && rate.productName === 'Correo Argentino Clasico';
    });

    return { rate: shipmentRate?.price ?? 0, dimensions: shipmentDimensions };
  }

  // función auxiliar para notificar por email cuando se concreta una orden
  private async notifyOrderByEmail(data: {
    from: string,
    to: string,
    topic: string,
    order: Order,
  }) {
    const orderDate = data.order?.createdAt
      ? new Date(data.order.createdAt).toLocaleString('es-AR', {
          dateStyle: 'long',
          timeStyle: 'short',
        })
      : 'No disponible';

    const itemsRows = (data.order?.items ?? []).map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.discount ? `${item.discount}%` : 'Sin descuento'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = Number(data.order?.subtotal ?? 0);
    const shippingCost = Number(data.order?.shipment?.shipment_cost ?? 0);
    const totalWithShipping = subtotal + shippingCost;

    const shipmentContent = data.order?.shipment
      ? `
        <p style="margin: 4px 0;"><strong>Destinatario:</strong> ${data.order.shipment.fullName || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Correo:</strong> ${data.order.shipment.email || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${data.order.shipment.phone || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Dirección:</strong> ${data.order.shipment.streetName || ''} ${data.order.shipment.streetNumber || ''}, ${data.order.shipment.city || ''}</p>
        <p style="margin: 4px 0;"><strong>Tipo de entrega:</strong> ${data.order.shipment.deliveredType === 'D' ? 'Entrega en Domicilio' : data.order.shipment.deliveredType === 'S' ? 'Retiro en Sucursal' : 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Costo de envío:</strong> $${Number(data.order.shipment.shipment_cost ?? 0).toFixed(2)}</p>
      `
      : '<p style="margin: 4px 0;">No hay datos de envío para esta orden.</p>';

    const paymentContent = data.order?.payment
      ? `
        <p style="margin: 4px 0;"><strong>Método:</strong> ${data.order.payment.method || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p style="margin: 4px 0;"><strong>Envío:</strong> $${shippingCost.toFixed(2)}</p>
        <p style="margin: 4px 0;"><strong>Total general:</strong> $${totalWithShipping.toFixed(2)}</p>
      `
      : '<p style="margin: 4px 0;">No hay datos de pago para esta orden.</p>';

    const mail: SendEmailDto = {
      from: `${env.APP_NAME} - ${data.from}`,
      subject: data.topic,
      to: [`${data.to}`],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; color: #111827;">
          <div style="background: #111827; color: #ffffff; padding: 24px;">
            <h2 style="margin: 0; font-size: 24px;">${data.topic}</h2>
            <p style="margin: 6px 0 0;">Orden #${data.order?.id ?? 'N/A'} • ${orderDate}</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <p style="margin: 0 0 8px;">Hola,</p>
            <p style="margin: 0 0 16px;">Se registró una nueva venta con los siguientes datos:</p>

            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              <p style="margin: 4px 0;"><strong>Estado:</strong> ${data.order?.status || 'Pendiente'}</p>
              <p style="margin: 4px 0;"><strong>Subtotal:</strong> $${Number(data.order?.subtotal ?? 0).toFixed(2)}</p>
              <p style="margin: 4px 0;"><strong>Total:</strong> $${Number(data.order?.total ?? 0).toFixed(2)}</p>
            </div>

            <h3 style="margin: 0 0 8px;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f3f4f6; text-align: left;">
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Producto</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Cant.</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Precio</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Desc.</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows || '<tr><td colspan="5" style="padding: 8px;">No hay productos disponibles.</td></tr>'}
              </tbody>
            </table>

            <h3 style="margin: 0 0 8px;">Envío</h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              ${shipmentContent}
            </div>

            <h3 style="margin: 0 0 8px;">Pago</h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
              ${paymentContent}
            </div>
          </div>
        </div>
      `
    }
    await this.emailsService.sendMail(mail, [], {
      pass: env.SMTP_PASS,
      user: env.SMTP_USER
    });
  }

  private async notificationCustomerByEmail(data: {
    user: { pass: string, email: string },
    from: string,
    to: string,
    topic: string,
    order: Order,
  }) {
    const orderDate = data.order?.createdAt
      ? new Date(data.order.createdAt).toLocaleString('es-AR', {
          dateStyle: 'long',
          timeStyle: 'short',
        })
      : 'No disponible';

    const itemsRows = (data.order?.items ?? []).map((item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${Number(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = Number(data.order?.subtotal ?? 0);
    const shippingCost = Number(data.order?.shipment?.shipment_cost ?? 0);
    const totalWithShipping = subtotal + shippingCost;

    const shipmentContent = data.order?.shipment
      ? `
        <p style="margin: 4px 0;"><strong>Destinatario:</strong> ${data.order.shipment.fullName || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Correo:</strong> ${data.order.shipment.email || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${data.order.shipment.phone || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Dirección:</strong> ${data.order.shipment.streetName || ''} ${data.order.shipment.streetNumber || ''}, ${data.order.shipment.city || ''}</p>
        <p style="margin: 4px 0;"><strong>Tipo de entrega:</strong> ${data.order.shipment.deliveredType === 'D' ? 'Entrega en Domicilio' : data.order.shipment.deliveredType === 'S' ? 'Retiro en Sucursal' : 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Costo de envío:</strong> $${shippingCost.toFixed(2)}</p>
      `
      : '<p style="margin: 4px 0;">No hay datos de envío para esta orden.</p>';

    const paymentContent = data.order?.payment
      ? `
        <p style="margin: 4px 0;"><strong>Método:</strong> ${data.order.payment.method || 'No informado'}</p>
        <p style="margin: 4px 0;"><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
        <p style="margin: 4px 0;"><strong>Envío:</strong> $${shippingCost.toFixed(2)}</p>
        <p style="margin: 4px 0;"><strong>Total general:</strong> $${totalWithShipping.toFixed(2)}</p>
      `
      : '<p style="margin: 4px 0;">No hay datos de pago para esta orden.</p>';

    const mail: SendEmailDto = {
      from: `${data.from}`,
      subject: data.topic,
      to: [`${data.to}`],
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; color: #111827;">
          <div style="background: #111827; color: #ffffff; padding: 24px;">
            <h2 style="margin: 0; font-size: 24px;">${data.topic}</h2>
            <p style="margin: 6px 0 0;">Orden #${data.order?.id ?? 'N/A'} • ${orderDate}</p>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <p style="margin: 0 0 8px;">Hola,</p>
            <p style="margin: 0 0 16px;">Tu compra se realizó con éxito. Estos son los detalles de tu pedido:</p>

            <h3 style="margin: 0 0 8px;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f3f4f6; text-align: left;">
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Producto</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Cant.</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Precio</th>
                  <th style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows || '<tr><td colspan="4" style="padding: 8px;">No hay productos disponibles.</td></tr>'}
              </tbody>
            </table>

            <h3 style="margin: 0 0 8px;">Envío</h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
              ${shipmentContent}
            </div>

            <h3 style="margin: 0 0 8px;">Pago</h3>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
              ${paymentContent}
            </div>
          </div>
        </div>
      `
    };
    await this.emailsService.sendMail(mail, [], {
      pass: data.user.pass,
      user: data.user.email
    });
  }
}