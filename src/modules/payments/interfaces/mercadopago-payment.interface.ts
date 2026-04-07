import { ApiProperty } from '@nestjs/swagger';

export class MercadopagoPaymentInterface {
  @ApiProperty({ example: 152598828503, description: 'ID del pago' })
  id: number;

  @ApiProperty({ example: 'approved', description: 'Estado del pago', required: false })
  status?: string; // e.g. 'approved'

  @ApiProperty({ example: 'accredited', description: 'Detalle del estado', required: false })
  status_detail?: string; // e.g. 'accredited'

  @ApiProperty({ example: 100, description: 'Monto de la transacción', required: false })
  transaction_amount?: number;

  @ApiProperty({ example: 0, description: 'Monto reembolsado', required: false })
  transaction_amount_refunded?: number;

  @ApiProperty({ example: 'ARS', description: 'Moneda', required: false })
  currency_id?: string; // e.g. 'ARS'

  @ApiProperty({ example: '2026-04-05T04:22:09.000-04:00', description: 'Fecha de aprobación', required: false })
  date_approved?: string;

  @ApiProperty({ example: '2026-04-05T04:22:08.000-04:00', description: 'Fecha de creación', required: false })
  date_created?: string;

  @ApiProperty({ example: '2026-04-05T04:22:14.000-04:00', description: 'Última actualización', required: false })
  date_last_updated?: string;

  @ApiProperty({ example: '666', description: 'Referencia externa (ej: order id)', required: false })
  external_reference?: string | null; // e.g. order id

  @ApiProperty({ example: 'https://miapp.com/notify', description: 'URL de notificación', required: false })
  notification_url?: string | null;

  @ApiProperty({ example: 2517431499, description: 'Collector id', required: false })
  collector_id?: number;

  @ApiProperty({ description: 'Información del pagador', required: false, type: Object })
  payer?: {
    id?: string;
    email?: string;
    first_name?: string | null;
    last_name?: string | null;
    identification?: {
      number?: string;
      type?: string;
    } | null;
    phone?: {
      area_code?: string | null;
      number?: string | null;
      extension?: string | null;
    } | null;
    [key: string]: any;
  } | null;

  @ApiProperty({ description: 'Método de pago (información básica)', required: false, type: Object })
  payment_method?: {
    id?: string;
    issuer_id?: string | null;
    type?: string;
    [key: string]: any;
  } | null;

  @ApiProperty({ example: 'account_money', description: 'ID del método de pago', required: false })
  payment_method_id?: string;

  @ApiProperty({ example: 'account_money', description: 'Tipo de método de pago', required: false })
  payment_type_id?: string;

  @ApiProperty({ description: 'Información adicional (items, ip, tracking)', required: false, type: Object })
  additional_info?: {
    ip_address?: string | null;
    tracking_id?: string | null;
    items?: Array<{
      id?: string | number | null;
      title?: string;
      description?: string | null;
      category_id?: string | null;
      quantity?: string | number | null;
      unit_price?: string | number | null;
      [key: string]: any;
    }> | null;
    [key: string]: any;
  } | null;

  @ApiProperty({ description: 'Detalles de cargos (fees)', required: false, type: [Object] })
  charges_details?: Array<{
    name?: string;
    amount?: number;
    rate?: number;
    fee_payer?: string;
    [key: string]: any;
  }> | null;

  @ApiProperty({ description: 'Point of interaction (checkout info)', required: false, type: Object })
  point_of_interaction?: any;

  @ApiProperty({ description: 'Orden asociada', required: false, type: Object })
  order?: { id?: string; type?: string } | null;

  // Flexible catch-all for other fields returned by MercadoPago
  [key: string]: any;
}