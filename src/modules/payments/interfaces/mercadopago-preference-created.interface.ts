import { ApiProperty } from '@nestjs/swagger';

export class MercadopagoPreferenceCreatedPayload {
  @ApiProperty({
    example: '2517431499-bcc8dae5-f324-4e15-80e2-a0aaf9bac19f',
    description: 'ID de la preferencia',
  })
  id: string;

  @ApiProperty({
    example: 'approved',
    required: false,
  })
  auto_return?: string;

  @ApiProperty({
    required: false,
    type: Object,
  })
  back_urls?: {
    success?: string;
    pending?: string;
    failure?: string;
  };

  @ApiProperty({ example: false, required: false })
  binary_mode?: boolean;

  @ApiProperty({ example: '8274839262963894', required: false })
  client_id?: string;

  @ApiProperty({ example: 2517431499, required: false })
  collector_id?: number;

  @ApiProperty({ required: false, nullable: true })
  coupon_code?: string | null;

  @ApiProperty({ required: false, nullable: true })
  coupon_labels?: string[] | null;

  @ApiProperty({
    example: '2026-07-13T22:35:49.250-04:00',
    required: false,
  })
  date_created?: string;

  @ApiProperty({ required: false, nullable: true })
  date_of_expiration?: string | null;

  @ApiProperty({ required: false, nullable: true })
  expiration_date_from?: string | null;

  expiration_date_to?: string | null;

  @ApiProperty({ example: false, required: false })
  expires?: boolean;

  @ApiProperty({ example: '4', required: false })
  external_reference?: string;

  @ApiProperty({
    example:
      'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...',
    required: false,
  })
  init_point?: string;

  @ApiProperty({ required: false, nullable: true })
  internal_metadata?: Record<string, any> | null;

  @ApiProperty({
    type: [Object],
    required: false,
  })
  items?: Array<{
    id?: string;
    title?: string;
    description?: string;
    picture_url?: string;
    category_id?: string;
    currency_id?: string;
    quantity?: number;
    unit_price?: number;
  }>;

  @ApiProperty({ required: false })
  marketplace?: string;

  @ApiProperty({ required: false })
  marketplace_fee?: number;

  @ApiProperty({
    required: false,
    type: Object,
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    required: false,
  })
  notification_url?: string;

  @ApiProperty({
    example: 'regular_payment',
    required: false,
  })
  operation_type?: string;

  @ApiProperty({
    required: false,
    type: Object,
  })
  payer?: {
    name?: string;
    surname?: string;
    email?: string;

    phone?: {
      area_code?: string;
      number?: string;
    };

    identification?: {
      type?: string;
      number?: string;
    };

    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: number | null;
    };

    date_created?: string | null;
    last_purchase?: string | null;
  };

  @ApiProperty({
    required: false,
    type: Object,
  })
  payment_methods?: {
    default_card_id?: string | null;
    default_payment_method_id?: string | null;

    excluded_payment_methods?: Array<{
      id?: string;
    }>;

    excluded_payment_types?: Array<{
      id?: string;
    }>;

    installments?: number | null;
    default_installments?: number | null;
  };

  @ApiProperty({
    required: false,
    nullable: true,
  })
  processing_modes?: string[] | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  product_id?: string | null;

  @ApiProperty({
    required: false,
  })
  preference_expired?: boolean;

  @ApiProperty({
    required: false,
    type: Object,
  })
  redirect_urls?: {
    success?: string;
    pending?: string;
    failure?: string;
  };

  @ApiProperty({
    required: false,
  })
  sandbox_init_point?: string;

  @ApiProperty({
    example: 'MLA',
    required: false,
  })
  site_id?: string;

  @ApiProperty({
    required: false,
    type: Object,
  })
  shipments?: {
    default_shipping_method?: any;

    receiver_address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: number | null;
      floor?: string;
      apartment?: string;
      city_name?: string | null;
      state_name?: string | null;
      country_name?: string | null;
      neighborhood?: string | null;
    };
  };

  @ApiProperty({
    required: false,
  })
  statement_descriptor?: string;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  total_amount?: number | null;

  @ApiProperty({
    required: false,
    nullable: true,
  })
  last_updated?: string | null;

  @ApiProperty({
    required: false,
  })
  financing_group?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Información adicional enviada al crear la preferencia.',
  })
  additional_info?: any;

  [key: string]: any;
}