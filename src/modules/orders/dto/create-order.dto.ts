import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from "class-validator";
import { PaymentMethodsEnum } from "../../payments/enum/payment-methods.enum";
import { DeliveryTypeEnum } from "../../shipments/enum/delivery-type.enum";

export class CretateOrderItemsDto {
  @ApiProperty({
    description: 'Identificador único del item que se desea comprar',
    example: 99
  })
  @IsNumber()
  @IsNotEmpty()
  item_id: number;

  @ApiProperty({
    description: 'Cantidad de un item que se desea comprar',
    example: 10
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number
}

export class CreateOrderPaymentDto {
  @ApiProperty({
    description: 'Método de pago que se desea utilizar para la orden de compra',
    example: PaymentMethodsEnum.MERCADOPAGO
  })
  @IsOptional()
  @IsString()
  method?: PaymentMethodsEnum
}

export class CreateOrderShipmentDto {
  @ApiProperty({
    description: 'Tipo de entrega: "D" para entrega a domicilio, "S" para retiro en sucursal.',
    enum: DeliveryTypeEnum,
    example: DeliveryTypeEnum.HOME,
  })
  @IsEnum(DeliveryTypeEnum)
  @IsOptional()
  deliveredType?: DeliveryTypeEnum;

  @ApiProperty({
    description: 'Código o identificador de la sucursal donde se retirará el envío. Obligatorio cuando el tipo de entrega es sucursal.',
    example: 'COR001',
  })
  @IsString()
  @IsOptional()
  pickupLocation?: string;

  @ApiProperty({
    description: 'Nombre completo del destinatario.',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Documento Nacional de Identidad (DNI) del destinatario.',
    example: '30123456',
  })
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({
    description: 'Teléfono de contacto del destinatario.',
    example: '+5493764123456',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario.',
    example: 'juan.perez@email.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Nombre de la calle del domicilio de entrega.',
    example: 'Av. Corrientes',
  })
  @IsString()
  @IsOptional()
  streetName?: string;

  @ApiProperty({
    description: 'Número de la calle del domicilio de entrega.',
    example: '1234',
  })
  @IsString()
  @IsOptional()
  streetNumber?: string;

  @ApiProperty({
    description: 'Ciudad o localidad de destino.',
    example: 'Buenos Aires',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    description: 'Nombre de la provincia de destino.',
    example: 'Ciudad Autónoma de Buenos Aires',
  })
  @IsString()
  @IsOptional()
  provinceName?: string;

  @ApiProperty({
    description: 'Código de la provincia según Correo Argentino.',
    example: 'C',
  })
  @IsString()
  @IsOptional()
  provinceCode?: string;

  @ApiProperty({
    description: 'Código postal de destino.',
    example: '1040',
  })
  @IsString()
  @IsNotEmpty()
  postalCodeDestination: string;

  @ApiProperty({
    description: 'Código postal de origen. Si no se envía, se utilizará el configurado por defecto.',
    example: '3300',
  })
  @IsString()
  @IsOptional()
  postalCodeOrigin?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Identificador único del usuario que realiza la orden de compra',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  user_id?: number

  @ApiProperty({
    description: 'Lista de items que se desean comprar en la orden de compra',
    example: [CretateOrderItemsDto],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CretateOrderItemsDto)
  items?: CretateOrderItemsDto[]

  @ApiProperty({
    description: 'Datos de envío de la orden de compra',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderShipmentDto)
  shipment?: CreateOrderShipmentDto
  

  @ApiProperty({
    description: 'Código de cupón que se desea aplicar a la orden de compra',
    example: "CUPON10"
  })
  @IsOptional()
  @IsString()
  coupon?: string

  @ApiProperty({
    description: 'Datos de pago de la orden de compra',
    example: PaymentMethodsEnum.MERCADOPAGO
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateOrderPaymentDto)
  payment?: CreateOrderPaymentDto
}