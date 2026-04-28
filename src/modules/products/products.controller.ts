import { BadRequestException, Body, Controller, Injectable, PipeTransform, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/enums/roles.enum';
import { UseRoleAuthToken } from '../../core/auth/decorators/auth.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Injectable()
export class ParseJSONPipe implements PipeTransform {
  transform(value: string) {
    try {
      return JSON.parse(value);
    } catch (error) {
      throw new BadRequestException('Invalid JSON format');
    }
  }
}

@ApiTags('Products')
@ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseRoleAuthToken(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Crear producto', description: 'Permite a un administrador crear un nuevo producto en el sistema.' })
  @ApiBody({ type: CreateProductDto, description: 'Datos necesarios para crear un nuevo producto.' })
  create(@Body('product', ParseJSONPipe) createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      return this.productsService.create(createProductDto, files)
    } catch (error) {
      return error.message;
    }
  }
}