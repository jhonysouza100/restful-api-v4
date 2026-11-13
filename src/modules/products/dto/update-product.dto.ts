import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['company_id'] as const),
) {
  @ApiProperty({
    example: 1,
    description: 'ID de la compañía propietaria del producto',
  })
  company_id!: number;
}
