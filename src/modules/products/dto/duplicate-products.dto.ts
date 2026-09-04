import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class DuplicateProductsDto {
  @ApiProperty({ example: [1, 2], description: 'IDs de los productos que se duplicarán' })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}