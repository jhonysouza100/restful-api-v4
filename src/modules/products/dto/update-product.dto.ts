import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['tenant_id'] as const),
) {
  @ApiProperty({
    example: 1,
    description: 'ID de la compañía propietaria del producto',
  })
  tenant_id!: number;
}
