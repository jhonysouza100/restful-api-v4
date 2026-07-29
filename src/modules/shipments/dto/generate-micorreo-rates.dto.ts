import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsEnum, IsInt, IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator"
import { DeliveryTypeEnum } from "../enum/delivery-type.enum"

export class MiCorreoDimensionsDto {
  @ApiProperty({
    description: "Peso en gramos del envío (mínimo 1g y máximo 25000g)",
    example: 2500,
  })
  @IsInt()
  @Min(1)
  @Max(25000)
  @IsNotEmpty()
  weight: number

  @ApiProperty({
    description: "Alto en centímetros del envío (máximo 150cm)",
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(150)
  @IsNotEmpty()
  height: number

  @ApiProperty({
    description: "Ancho en centímetros del envío (máximo 150cm)",
    example: 20,
  })
  @IsInt()
  @Min(1)
  @Max(150)
  @IsNotEmpty()
  width: number

  @ApiProperty({
    description: "Largo en centímetros del envío (máximo 150cm)",
    example: 30,
  })
  @IsInt()
  @Min(1)
  @Max(150)
  @IsNotEmpty()
  length: number
}

export class GenerateMiCorreoRatesDto {
  @ApiProperty({
    description: 'Nro. de cuenta en Correo Argentino',
    example: '000789456'
  })
  @IsString()
  @IsOptional()
  customerId?: string

  @ApiProperty({
    description: "Código postal de origen del envío a cotizar",
    example: "1757",
  })
  @IsString()
  @IsOptional()
  postalCodeOrigin?: string

  @ApiProperty({
    description: "Código postal de destino del envío a cotizar",
    example: "1040",
  })
  @IsString()
  @IsNotEmpty()
  postalCodeDestination: string

  @ApiProperty({
    description: 'Tipo de entrega: "D" para entrega a domicilio, "S" para entrega en sucursal',
    enum: DeliveryTypeEnum,
    example: DeliveryTypeEnum.HOME,
  })
  @IsEnum(DeliveryTypeEnum)
  @IsOptional()
  deliveredType?: DeliveryTypeEnum

  @ApiProperty({
    description: "Dimensiones del envío",
    type: MiCorreoDimensionsDto,
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => MiCorreoDimensionsDto)
  dimensions: MiCorreoDimensionsDto
}