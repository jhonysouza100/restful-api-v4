import { ApiProperty } from "@nestjs/swagger";

class MiCorreoRatesInterface {
  @ApiProperty({
    description: 'Tipo de entrega: "D" para entrega a domicilio, "S" para entrega en sucursal',
    example: "S",
  })
  deliveredType: string

  @ApiProperty({
    description: "Código del producto",
    example: "CP/EP",
  })
  productType: string

  @ApiProperty({
    description: "Nombre del envío",
    example: "Correo Argentino Clasico/Expreso",
  })
  productName: string

  @ApiProperty({
    description: "Precio de la tarifa",
    example: 6715.0,
  })
  price: number

  @ApiProperty({
    description: "Tiempo mínimo de entrega en días",
    example: "2",
  })
  deliveryTimeMin: string

  @ApiProperty({
    description: "Tiempo máximo de entrega en días",
    example: "5",
  })
  deliveryTimeMax: string
}

export class MiCorreoRatesResponseInterface {
  @ApiProperty({
    description: "Identificador de usuario de MiCorreo",
    example: "0001207512",
  })
  customerId: string

  @ApiProperty({
    description: "Fecha y hora de validez de la cotización",
    example: "2026-07-21T22:06:12.658-03:00",
  })
  validTo: string

  @ApiProperty({
    description: "Listado de tarifas disponibles",
  })
  rates: MiCorreoRatesInterface[]
}