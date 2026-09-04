import { ApiProperty } from '@nestjs/swagger';
import { ProductCategoryEnum } from '../enums/products.enum';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

class ProductImageInterface {
  @ApiProperty({ example: 'imagen123', description: 'ID público de la imagen en el servicio de almacenamiento' })
  @IsString()
  @IsNotEmpty()
  public_id: string;

  @ApiProperty({ example: 'https://example.com/imagen.jpg', description: 'URL segura de la imagen' })
  @IsString()
  @IsNotEmpty()
  secure_url: string;
}

class ProductSpecificationsInterface {
  @ApiProperty({ example: 'Conectividad', description: 'Etiqueta de la especificación del producto' })
  @IsString()
  @IsNotEmpty()
  label: string;
  
  @ApiProperty({ example: 'USB-C', description: 'Valor de la especificación del producto' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

class ProductDimensionsInterface {
  @ApiProperty({ example: 500, description: 'Peso del producto en centimetros'})
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  weight: number;

  @ApiProperty({ example: 10, description: 'Altura del producto en centimetros'})
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  height: number;
  
  @ApiProperty({ example: 20, description: 'Ancho del producto en centimetros'})
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  width: number;
  
  @ApiProperty({ example: 1000, description: 'Largo del producto en gramos'})
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  length: number;
}

class ProductColorInterface {
  @ApiProperty({ example: 'Rojo', description: 'Nombre del color' })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({ example: '#f00', description: 'Código del color' })
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Nombre del producto' })
  name: string;
  
  @ApiProperty({ example: 'Articulo Varios', description: 'Nombre del producto para ventas secretas' })
  @IsOptional()
  @IsString()
  alias?: string;

  @ApiProperty({ example: 'Laptop de gama alta', description: 'Descripción del producto' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
  
  @ApiProperty({ example: ProductCategoryEnum.OTHER, description: 'Categoría del producto' })
  @IsEnum(ProductCategoryEnum)
  @IsOptional()
  category?: ProductCategoryEnum;
  
  @ApiProperty({ example: 'MarcaX', description: 'Marca del producto' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ example: 'ModeloY', description: 'Modelo del producto' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({
    example: [{ label: 'Conectividad', value: 'USB-C' }], 
    description: 'Lista de especificaciones del producto' 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  specifications?: ProductSpecificationsInterface[];
  
  @ApiProperty({
    example: { height: 500, width: 200, weight: 1000 },
    description: 'Dimensiones del producto'
  })
  @IsOptional()
  @ValidateNested({ each: true })
  dimensions?: ProductDimensionsInterface;
  
  @ApiProperty({ 
    example: [{ public_id: 'imagen123', secure_url: 'https://example.com/imagen.jpg' }], 
    description: 'Lista de imágenes del producto' 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  images?: ProductImageInterface[];
  
  @ApiProperty({
    example: { name: 'Rojo', value: '#f00'}
  })
  @IsOptional()
  @ValidateNested({ each: true })
  color?: ProductColorInterface;
  
  @ApiProperty({ example: 999.99, description: 'Precio del producto' })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  price: number;
  
  @ApiProperty({ example: 100, description: 'Cantidad de productos en stock', default: 1 })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  stock?: number;

  @ApiProperty({ example: 50, description: 'Cantidad máxima de productos que un cliente puede comprar', default: 1 })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(1)
  maxCount?: number;

  @ApiProperty({ example: 1, description: 'Cantidad mínima de productos que un cliente puede comprar', default: 1 })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(1)
  minCount?: number;
  
  @ApiProperty({ example: 10, description: 'Porcentaje de descuento del producto', default: 0 })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  discount?: number;
  
  @ApiProperty({ example: 4, description: 'Calificación promedio del producto' })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  rating?: number;

  @ApiProperty({ example: true, description: 'Estado del producto (activo o inactivo)', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}