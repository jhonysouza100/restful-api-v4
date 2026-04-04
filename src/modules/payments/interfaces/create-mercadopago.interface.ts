import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class BackUrls {
  @ApiProperty({ example: 'https://example.com/success', description: 'URL de éxito' })
  @IsOptional()
  @IsString()
  success?: string;

  @ApiProperty({ example: 'https://example.com/failure', description: 'URL de fallo' })
  @IsOptional()
  @IsString()
  failure?: string;

  @ApiProperty({ example: 'https://example.com/pending', description: 'URL de pendiente' })
  @IsOptional()
  @IsString()
  pending?: string;
}

class CategoryDescriptor {
  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha del evento' })
  @IsOptional()
  @IsDate()
  event_date?: Date;

  @ApiProperty({ description: 'Información del pasajero' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Passenger)
  passenger?: Passenger;

  @ApiProperty({ description: 'Información de la ruta' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Route)
  route?: Route;
}

class Passenger {
  @ApiProperty({ example: 'John', description: 'Nombre del pasajero' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del pasajero' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Identificación del pasajero' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Identification)
  identification?: Identification;
}

class Route {
  @ApiProperty({ example: 'City A', description: 'Lugar de partida' })
  @IsOptional()
  @IsString()
  departure?: string;

  @ApiProperty({ example: 'City B', description: 'Lugar de destino' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({ example: '2025-07-09T08:00:00Z', description: 'Fecha y hora de partida' })
  @IsOptional()
  @IsString()
  departure_date_time?: string;

  @ApiProperty({ example: '2025-07-09T12:00:00Z', description: 'Fecha y hora de llegada' })
  @IsOptional()
  @IsString()
  arrival_date_time?: string;

  @ApiProperty({ example: 'Company X', description: 'Compañía de transporte' })
  @IsOptional()
  @IsString()
  company?: string;
}

class Identification {
  @ApiProperty({ example: 'DNI', description: 'Tipo de identificación' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: '12345678', description: 'Número de identificación' })
  @IsOptional()
  @IsString()
  number?: string;
}

class Item {
  @ApiProperty({ example: '123', description: 'ID del producto' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 'Producto X', description: 'Título del producto' })
  @IsString()
  title: string;

  @ApiProperty({ example: 2, description: 'Cantidad del producto' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 100.0, description: 'Precio unitario del producto' })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ example: 'Descripción del producto', description: 'Descripción del producto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'electronics', description: 'ID de la categoría' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({ description: 'Descriptor de la categoría' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryDescriptor)
  category_descriptor?: CategoryDescriptor;
}

class Payer {
  @ApiProperty({ example: 'user@example.com', description: 'Correo electrónico del pagador' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'John', description: 'Nombre del pagador' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Doe', description: 'Apellido del pagador' })
  @IsOptional()
  @IsString()
  surname?: string;

  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha de registro' })
  @IsOptional()
  @IsString()
  registration_date?: string;

  @ApiProperty({ example: 'password', description: 'Tipo de autenticación' })
  @IsOptional()
  @IsString()
  authetication_type?: string;

  @ApiProperty({ example: true, description: 'Si es usuario prime' })
  @IsOptional()
  @IsBoolean()
  is_prime_user?: boolean;

  @ApiProperty({ example: true, description: 'Si es la primera compra online' })
  @IsOptional()
  @IsBoolean()
  is_first_purchase_online?: boolean;

  @ApiProperty({ example: '2025-07-08T00:00:00Z', description: 'Última compra' })
  @IsOptional()
  @IsString()
  last_purchase?: string;

  @ApiProperty({ description: 'Teléfono del pagador' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Phone)
  phone?: Phone;

  @ApiProperty({ description: 'Identificación del pagador' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Identification)
  identification?: Identification;

  @ApiProperty({ description: 'Dirección del pagador' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  address?: Address;
}

class Phone {
  @ApiProperty({ example: '11', description: 'Código de área' })
  @IsOptional()
  @IsString()
  area_code?: string;

  @ApiProperty({ example: '12345678', description: 'Número de teléfono' })
  @IsOptional()
  @IsString()
  number?: string;
}

class Address {
  @ApiProperty({ example: 'Calle Falsa', description: 'Nombre de la calle' })
  @IsOptional()
  @IsString()
  street_name?: string;

  @ApiProperty({ example: 123, description: 'Número de la calle' })
  @IsOptional()
  @IsNumber()
  street_number?: number;

  @ApiProperty({ example: '12345', description: 'Código postal' })
  @IsOptional()
  @IsString()
  zip_code?: string;
}

class PaymentMethods {
  @ApiProperty({ example: ['credit_card'], description: 'Tipos de pago excluidos' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_payment_types?: string[];

  @ApiProperty({ example: ['visa'], description: 'Métodos de pago excluidos' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excluded_payment_methods?: string[];

  @ApiProperty({ example: 12, description: 'Cuotas permitidas' })
  @IsOptional()
  @IsNumber()
  installments?: number;

  @ApiProperty({ example: 'visa', description: 'ID del método de pago predeterminado' })
  @IsOptional()
  @IsString()
  default_payment_method_id?: string;
}

export class CreateMercadopagoPreferenceInterface {
  @ApiProperty({ example: 'approved', description: 'Tipo de retorno automático' })
  @IsOptional()
  @IsString()
  auto_return?: string;

  @ApiProperty({ description: 'URLs de retorno' })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackUrls)
  back_urls?: BackUrls;

  @ApiProperty({ example: 'Compra en mi tienda', description: 'Descripción del estado' })
  @IsOptional()
  @IsString()
  statement_descriptor?: string;

  @ApiProperty({ example: true, description: 'Modo binario' })
  @IsOptional()
  @IsBoolean()
  binary_mode?: boolean;

  @ApiProperty({ example: 'ref123', description: 'Referencia externa' })
  @IsOptional()
  @IsString()
  external_reference?: string;

  @ApiProperty({ description: 'Lista de ítems' })
  @ValidateNested({ each: true })
  @Type(() => Item)
  items: Item[];

  @ApiProperty({ description: 'Información del pagador' })
  @IsOptional()
  @ValidateNested()
  @Type(() => Payer)
  payer?: Payer;

  @ApiProperty({ description: 'Métodos de pago' })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethods)
  payment_methods?: PaymentMethods;

  @ApiProperty({ example: 'https://example.com/notification', description: 'URL de notificación' })
  @IsOptional()
  @IsString()
  notification_url?: string;

  @ApiProperty({ example: true, description: 'Si expira' })
  @IsOptional()
  @IsBoolean()
  expires?: boolean;

  @ApiProperty({ example: '2025-07-09T00:00:00Z', description: 'Fecha de inicio de expiración' })
  @IsOptional()
  @IsString()
  expiration_date_from?: string;

  @ApiProperty({ example: '2025-07-10T00:00:00Z', description: 'Fecha de fin de expiración' })
  @IsOptional()
  @IsString()
  expiration_date_to?: string;
}

// Solo se usa internamente dentro del servicio para armar una "preference" de mercadopago