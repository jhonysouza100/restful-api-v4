import { ApiProperty } from '@nestjs/swagger';
import { ProductCategoryEnum } from '../enums/products.enum';

class ProductImageInterface {
  @ApiProperty({ example: 'imagen123', description: 'ID público de la imagen en el servicio de almacenamiento' })
  public_id: string;

  @ApiProperty({ example: 'https://example.com/imagen.jpg', description: 'URL segura de la imagen' })
  secure_url: string;
}

class ProductSpecificationsInterface {
  @ApiProperty({ example: 'Conectividad', description: 'Etiqueta de la especificación del producto' })
  label: string;
  
  @ApiProperty({ example: 'USB-C', description: 'Valor de la especificación del producto' })
  value: string;
}

class ProductDimensionsInterface {
  @ApiProperty({ example: 500, description: 'Peso del producto en centimetros'})
  weight: number;

  @ApiProperty({ example: 10, description: 'Altura del producto en centimetros'})
  height: number;
  
  @ApiProperty({ example: 20, description: 'Ancho del producto en centimetros'})
  width: number;
  
  @ApiProperty({ example: 1000, description: 'Largo del producto en gramos'})
  length: number;
}

class ProductColorInterface {
  @ApiProperty({ example: 'Rojo', description: 'Nombre del color' })
  name: string;
  
  @ApiProperty({ example: '#f00', description: 'Código del color' })
  value: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop', description: 'Nombre del producto' })
  name: string;
  
  @ApiProperty({ example: 'laptop-intel', description: 'Nombre del producto para SEO' })
  slug: string;
  
  @ApiProperty({ example: 'Articulo Varios', description: 'Nombre del producto para ventas secretas' })
  alias?: string;

  @ApiProperty({ example: 'Laptop de gama alta', description: 'Descripción del producto' })
  description: string;
  
  @ApiProperty({ example: ProductCategoryEnum.ELECTRONICS, description: 'Categoría del producto' })
  category: ProductCategoryEnum;
  
  @ApiProperty({ example: 'MarcaX', description: 'Marca del producto' })
  brand: string;

  @ApiProperty({ example: 'ModeloY', description: 'Modelo del producto' })
  model: string;

  @ApiProperty({
    type: () => ProductSpecificationsInterface, 
    isArray: true, 
    example: [{ label: 'Conectividad', value: 'USB-C' }], 
    description: 'Lista de especificaciones del producto' 
  })
  specifications?: ProductSpecificationsInterface[];
  
  @ApiProperty({
    type: () => ProductDimensionsInterface,
    example: { height: 500, width: 200, weight: 1000 },
    description: 'Dimensiones del producto'
  })
  dimensions?: ProductDimensionsInterface;
  
  @ApiProperty({ 
    type: () => ProductImageInterface, 
    isArray: true, 
    example: [{ public_id: 'imagen123', secure_url: 'https://example.com/imagen.jpg' }], 
    description: 'Lista de imágenes del producto' 
  })
  images?: ProductImageInterface[];
  
  @ApiProperty({
    type: () => ProductColorInterface,
    example: { name: 'Rojo', value: '#f00'}
  })
  color?: ProductColorInterface;
  
  @ApiProperty({ example: 999.99, description: 'Precio del producto' })
  price: number;
  
  @ApiProperty({ example: 100, description: 'Cantidad de productos en stock' })
  stock?: number;

  @ApiProperty({ example: 50, description: 'Cantidad máxima de productos que un cliente puede comprar', default: 1 })
  maxCount?: number;

  @ApiProperty({ example: 1, description: 'Cantidad mínima de productos que un cliente puede comprar', default: 1 })
  minCount?: number;
  
  @ApiProperty({ example: 10, description: 'Porcentaje de descuento del producto', default: 0 })
  discount?: number;
  
  @ApiProperty({ example: 4, description: 'Calificación promedio del producto' })
  rating?: number;

  @ApiProperty({ example: true, description: 'Estado del producto (activo o inactivo)', default: true })
  isActive?: boolean;
}