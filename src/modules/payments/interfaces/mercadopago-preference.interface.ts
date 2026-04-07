import { ApiProperty } from '@nestjs/swagger';

class BackUrls {
  @ApiProperty({ example: 'https://example.com/success', description: 'URL de éxito' })
  success?: string;

  @ApiProperty({ example: 'https://example.com/failure', description: 'URL de fallo' })
  failure?: string;

  @ApiProperty({ example: 'https://example.com/pending', description: 'URL de pendiente' })
  pending?: string;
}

class CategoryDescriptor {
  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha del evento' })
  event_date?: Date;

  @ApiProperty({ description: 'Información del pasajero' })
  passenger?: Passenger;

  @ApiProperty({ description: 'Información de la ruta' })
  route?: Route;
}

class Passenger {
  @ApiProperty({ example: 'John', description: 'Nombre del pasajero' })
  first_name?: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del pasajero' })
  last_name?: string;

  @ApiProperty({ description: 'Identificación del pasajero' })
  identification?: Identification;
}

class Route {
  @ApiProperty({ example: 'City A', description: 'Lugar de partida' })
  departure?: string;

  @ApiProperty({ example: 'City B', description: 'Lugar de destino' })
  destination?: string;

  @ApiProperty({ example: '2025-07-09T08:00:00Z', description: 'Fecha y hora de partida' })
  departure_date_time?: string;

  @ApiProperty({ example: '2025-07-09T12:00:00Z', description: 'Fecha y hora de llegada' })
  arrival_date_time?: string;

  @ApiProperty({ example: 'Company X', description: 'Compañía de transporte' })
  company?: string;
}

class Identification {
  @ApiProperty({ example: 'DNI', description: 'Tipo de identificación' })
  type?: string;

  @ApiProperty({ example: '12345678', description: 'Número de identificación' })
  number?: string;
}

class Item {
  @ApiProperty({ example: '123', description: 'ID del producto' })
  id?: string;

  @ApiProperty({ example: 'Producto X', description: 'Título del producto' })
  title: string;

  @ApiProperty({ example: 2, description: 'Cantidad del producto' })
  quantity: number;

  @ApiProperty({ example: 100.0, description: 'Precio unitario del producto' })
  unit_price: number;

  @ApiProperty({ example: 'Descripción del producto', description: 'Descripción del producto' })
  description?: string;

  @ApiProperty({ example: 'electronics', description: 'ID de la categoría' })
  category_id?: string;

  @ApiProperty({ description: 'Descriptor de la categoría' })
  category_descriptor?: CategoryDescriptor;
}

class Payer {
  @ApiProperty({ example: 'user@example.com', description: 'Correo electrónico del pagador' })
  email?: string;

  @ApiProperty({ example: 'John', description: 'Nombre del pagador' })
  name?: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del pagador' })
  surname?: string;

  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha de registro' })
  registration_date?: string;

  @ApiProperty({ example: 'password', description: 'Tipo de autenticación' })
  authetication_type?: string;

  @ApiProperty({ example: true, description: 'Si es usuario prime' })
  is_prime_user?: boolean;

  @ApiProperty({ example: true, description: 'Si es la primera compra online' })
  is_first_purchase_online?: boolean;

  @ApiProperty({ example: '2025-07-08T00:00:00Z', description: 'Última compra' })
  last_purchase?: string;

  @ApiProperty({ description: 'Teléfono del pagador' })
  phone?: Phone;

  @ApiProperty({ description: 'Identificación del pagador' })
  identification?: Identification;

  @ApiProperty({ description: 'Dirección del pagador' })
  address?: Address;
}

class Phone {
  @ApiProperty({ example: '11', description: 'Código de área' })
  area_code?: string;

  @ApiProperty({ example: '12345678', description: 'Número de teléfono' })
  number?: string;
}

class Address {
  @ApiProperty({ example: 'Calle Falsa', description: 'Nombre de la calle' })
  street_name?: string;

  @ApiProperty({ example: 123, description: 'Número de la calle' })
  street_number?: number;

  @ApiProperty({ example: '12345', description: 'Código postal' })
  zip_code?: string;
}

class PaymentMethods {
  @ApiProperty({ example: ['credit_card'], description: 'Tipos de pago excluidos' })
  excluded_payment_types?: string[];

  @ApiProperty({ example: ['visa'], description: 'Métodos de pago excluidos' })
  excluded_payment_methods?: string[];

  @ApiProperty({ example: 12, description: 'Cuotas permitidas' })
  installments?: number;

  @ApiProperty({ example: 'visa', description: 'ID del método de pago predeterminado' })
  default_payment_method_id?: string;
}

export class CreateMercadopagoPreferenceInterface {
  @ApiProperty({ example: 'approved', description: 'Tipo de retorno automático' })
  auto_return?: string;

  @ApiProperty({ description: 'URLs de retorno' })
  back_urls?: BackUrls;

  @ApiProperty({ example: 'Compra en mi tienda', description: 'Descripción del estado' })
  statement_descriptor?: string;

  @ApiProperty({ example: true, description: 'Modo binario' })
  binary_mode?: boolean;

  @ApiProperty({ example: 'ref123', description: 'Referencia externa' })
  external_reference?: string;

  @ApiProperty({ description: 'Lista de ítems' })
  items: Item[];

  @ApiProperty({ description: 'Información del pagador' })
  payer?: Payer;

  @ApiProperty({ description: 'Métodos de pago' })
  payment_methods?: PaymentMethods;

  @ApiProperty({ example: 'https://example.com/notification', description: 'URL de notificación' })
  notification_url?: string;

  @ApiProperty({ example: true, description: 'Si expira' })
  expires?: boolean;

  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha de inicio de expiración' })
  expiration_date_from?: string;

  @ApiProperty({ example: '2025-07-10T00:00:00Z', description: 'Fecha de fin de expiración' })
  expiration_date_to?: string;
}

// Solo se usa internamente dentro del servicio para armar una "preference" de mercadopago