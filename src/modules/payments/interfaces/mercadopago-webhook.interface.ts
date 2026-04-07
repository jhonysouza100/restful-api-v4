import { ApiProperty } from '@nestjs/swagger';

export class MercadopagoWebhookPayload {
  @ApiProperty({ example: 'payment.created', description: "Evento notificado (ej: 'payment.created')", required: false })
  action?: string; // e.g. 'payment.created'

  @ApiProperty({ example: 'v1', description: 'Versión de la API que envía la notificación', required: false })
  api_version?: string; // e.g. 'v1'

  @ApiProperty({
    example: { id: '152598828503' },
    description: 'Objeto con el id del recurso (pago, orden, etc.)',
    required: false,
  })
  data?: { id: string }; // order id

  @ApiProperty({ example: '2026-04-05T08:22:08Z', description: 'Fecha de creación (ISO)', required: false })
  date_created?: string; // ISO date string

  @ApiProperty({ example: 130425051313, description: 'ID de la notificación', required: false })
  id?: number; // notification id

  @ApiProperty({ example: true, description: 'Indica si es modo live', required: false })
  live_mode?: boolean;

  @ApiProperty({ example: 'payment', description: 'Tipo de tópico', required: false })
  type?: 'payment' | 'plan' | 'subscription' | 'invoice' | string;

  @ApiProperty({ example: '251743149', description: 'Identificador del usuario/vendedor', required: false })
  user_id?: string | number;

  // In some cases (errors / other topics) the payload can include other
  // fields like resource/topic used in comments.
  @ApiProperty({ example: 'https://api...', description: 'Recurso (opcional)', required: false })
  resource?: string;

  @ApiProperty({ example: 'merchant_order', description: 'Tópico (opcional)', required: false })
  topic?: string;

  [key: string]: any;
}