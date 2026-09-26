import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
};

export class FindProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Identificador del producto',
    example: 25,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  id?: number;

  @ApiPropertyOptional({
    description: 'Texto de búsqueda por términos'
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Alias de q para buscar por nombre'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Parametro para clasificar busquedas',
    example: 'new'
  })
  @IsOptional()
  @IsString()
  topic?: string;
  
  @ApiPropertyOptional({
    description: 'Numero de página',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    description: 'Limite de items por página',
    example: 6
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 6;

  @ApiPropertyOptional({
    description: 'Precio minimo',
    example: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio máximo',
    example: 1000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filtra por el estado isActive'
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de un item'
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'true para productos con stock'
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  stock?: boolean;

  @ApiPropertyOptional({
    description: 'Filtra por tenant en operaciones administrativa',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  tenant_id?: number;
}
