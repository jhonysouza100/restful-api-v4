import { ApiProperty } from "@nestjs/swagger";

export class MercadopagoResponse {
  @ApiProperty({
    description: 'ID de la notificación',
    example: 12345
  })
  id?: string;
  
  @ApiProperty({
    description: 'Indica si la URL ingresada es válida.',
    example: true
  })
  live_mode?: boolean;
  
  @ApiProperty({
    description: 'Tipo de notificacion recebida e acuerdo con el tópico previamente seleccionado (payments, mp-connect, subscription, claim, automatic-payments, etc).',
    type: String,
    example: 'payment'
  })
  type?: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
  
  @ApiProperty({
    description: 'Fecha de creación del recurso notificado.',
    type: String,
    example: '2015-03-25T10:04:58.396-04:00'
  })
  date_created?: string;
  
  @ApiProperty({
    description: 'Identificador del vendedor.',
    type: Number,
    example: 44444
  })
  user_id?: number;
  
  @ApiProperty({
    description: 'Valor que indica la versión de la API que envía la notificación.',
    type: String,
    example: "v1"
  })
  api_version?: string;
  
  @ApiProperty({
    description: 'Evento notificado, que indica si es una actualización de un recurso o la creación de uno nuevo.',
    type: String,
    example: "payment.created"
  })
  action?: string;
  
  @ApiProperty({
    description: 'ID del pago, de la orden comercial o del reclamo.',
    type: String,
    example: { id: "999999999" }
  })
  data?: {
    id: string;
  };
}

// Solo se usa como interfaz y documentacion de la respuesta del POST de mercadopago API