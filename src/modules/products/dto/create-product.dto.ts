import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsPositive, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { ProductCategoryEnum } from '../enums/products.enum';

class ProductImageInterface {
  @ApiProperty({ example: 'imagen123', description: 'ID público de la imagen en el servicio de almacenamiento' })
  @IsString({ message: 'El public_id debe ser un texto' })
  public_id: string;

  @ApiProperty({ example: 'https://example.com/imagen.jpg', description: 'URL segura de la imagen' })
  @IsString({ message: 'El secure_url debe ser un texto' })
  secure_url: string;
}

class ProductSpecificationsInterface {
  @ApiProperty({ example: 'Conectividad', description: 'Etiqueta de la especificación del producto' })
  @IsNotEmpty({ message: 'La etiqueta es obligatoria' })
  @IsString({ message: 'La etiqueta debe ser un texto' })
  label: string;
  
  @ApiProperty({ example: 'USB-C', description: 'Valor de la especificación del producto' })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  @IsString({ message: 'El valor debe ser un texto' })
  value: string;
}

class ProductDimensionsInterface {
  @ApiProperty({ example: 500, description: 'Altura del producto en centimetros'})
  @IsNotEmpty({ message: 'La altura es obligatoria' })
  @IsNumber({}, { message: 'La altura debe ser un número' })
  @IsPositive({ message: 'La altura debe ser un número positivo' })
  height: number;
  
  @ApiProperty({ example: 200, description: 'Ancho del producto en centimetros'})
  @IsNotEmpty({ message: 'El ancho es obligatorio' })
  @IsNumber({}, { message: 'El ancho debe ser un número' })
  @IsPositive({ message: 'El ancho debe ser un número positivo' })
  width: number;
  
  @ApiProperty({ example: 1000, description: 'Peso del producto en gramos'})
  @IsNotEmpty({ message: 'El peso es obligatorio' })
  @IsNumber({}, { message: 'El peso debe ser un número' })
  @IsPositive({ message: 'El peso debe ser un número positivo' })
  weight: number;
}

class ProductColorInterface {
  @ApiProperty({ example: 'Rojo', description: 'Nombre del color' })
  @IsNotEmpty({ message: 'La nombre del color es obligatorio' })
  @IsString({ message: 'El nombre del color debe ser un texto' })
  name: string;
  
  @ApiProperty({ example: '#f00', description: 'Código del color' })
  @IsNotEmpty({ message: 'La valor del color es obligatorio' })
  @IsString({ message: 'El valor del color debe ser un texto' })
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Nombre del producto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  name: string;
  
  @ApiProperty({ example: 'laptop-intel', description: 'Nombre del producto para SEO' })
  @IsNotEmpty({ message: 'El slug es obligatorio' })
  @IsString({ message: 'El slug debe ser un texto' })
  slug: string;
  
  @ApiProperty({ example: 'Articulo Varios', description: 'Nombre del producto para ventas secretas' })
  @IsOptional()
  @IsString({ message: 'El alias debe ser un texto' })
  alias?: string;

  @ApiProperty({ example: 'Laptop de gama alta', description: 'Descripción del producto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser un texto' })
  description: string;
  
  @ApiProperty({ example: ProductCategoryEnum.ELECTRONICS, description: 'Categoría del producto' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsEnum(ProductCategoryEnum, { message: 'La categoría debe ser un valor válido' })
  category: ProductCategoryEnum;
  
  @ApiProperty({ example: 'MarcaX', description: 'Marca del producto' })
  @IsNotEmpty({ message: 'La marca es obligatoria' })
  @IsString({ message: 'La marca debe ser un texto' })
  brand: string;

  @ApiProperty({ example: 'ModeloY', description: 'Modelo del producto' })
  @IsNotEmpty({ message: 'El modelo es obligatorio' })
  @IsString({ message: 'El modelo debe ser un texto' })
  model: string;

  @ApiProperty({
    type: () => ProductSpecificationsInterface, 
    isArray: true, 
    example: [{ label: 'Conectividad', value: 'USB-C' }], 
    description: 'Lista de especificaciones del producto' 
  })
  @IsOptional()
  specifications?: ProductSpecificationsInterface[];
  
  @ApiProperty({
    type: () => ProductDimensionsInterface,
    example: { height: 500, width: 200, weight: 1000 },
    description: 'Dimensiones del producto'
  })
  @IsOptional()
  dimensions?: ProductDimensionsInterface;
  
  @ApiProperty({ 
    type: () => ProductImageInterface, 
    isArray: true, 
    example: [{ public_id: 'imagen123', secure_url: 'https://example.com/imagen.jpg' }], 
    description: 'Lista de imágenes del producto' 
  })
  @IsOptional()
  images?: ProductImageInterface[];
  
  @ApiProperty({
    type: () => ProductColorInterface,
    example: { name: 'Rojo', value: '#f00'}
  })
  @IsOptional()
  color?: ProductColorInterface;
  
  @ApiProperty({ example: 999.99, description: 'Precio del producto' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  price: number;
  
  @ApiProperty({ example: 100, description: 'Cantidad de productos en stock' })
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @IsPositive({ message: 'El stock debe ser un número positivo' })
  @IsOptional()
  stock?: number;
  
  @ApiProperty({ example: 10, description: 'Porcentaje de descuento del producto', default: 0 })
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @IsPositive({ message: 'El descuento debe ser un número positivo' })
  @IsOptional()
  discount?: number;
  
  @ApiProperty({ example: 4, description: 'Calificación promedio del producto' })
  @IsNumber({}, { message: 'La calificación debe ser un número' })
  @IsPositive({ message: 'La calificación debe ser un número positivo' })
  @Min(1, { message: 'La calificación no debe ser menor a 1' })
  @Max(5, { message: 'La calificación no debe ser mayor a 5' })
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: true, description: 'Estado del producto (activo o inactivo)', default: true })
  @IsBoolean({ message: 'El estado debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;
}