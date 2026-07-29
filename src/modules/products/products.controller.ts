import { BadRequestException, Body, Controller, Delete, Get, Injectable, Param, Patch, PipeTransform, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiExtraModels, ApiHeader, ApiOperation, ApiParam, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Role } from '../../common/enums/roles.enum';
import { UseRoleAuthToken } from '../../core/auth/decorators/auth.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { UseTenantGuard } from '../../core/tenant/decorators/tenant.decorator';

@Injectable()
class ParseJSONPipe implements PipeTransform {
  transform(value: unknown) {
    if (value === null || value === undefined) {
      return {};
    }

    if (typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    throw new BadRequestException('Invalid JSON format');
  }
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseRoleAuthToken(Role.ADMIN)
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  @ApiOperation({ summary: 'Crear producto', description: 'Permite a un administrador crear un nuevo producto en el sistema.' })
  @ApiConsumes('multipart/form-data')
  /**
   * Si quieres que Swagger muestre la estructura del DTO,
   * product debe referenciarse con $ref: getSchemaPath(CreateProductDto) y
   * debes usar @ApiExtraModels(CreateProductDto) para que el modelo se incluya en la documentación.
   */
  @ApiExtraModels(CreateProductDto)
  @ApiBody({ 
    description: 'Datos necesarios para crear un nuevo producto.',
    schema: {
      type: 'object',
      properties: {
        product: {
          $ref: getSchemaPath(CreateProductDto)
        },
        files: {
          type: 'array',
          description: 'Archivos de imagenes (opcionales) para adjuntar al producto.',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['product'],
    },
  })
  // Interceptor para manejar la carga de archivos. Se espera que los archivos se envíen en el campo 'files' del formulario multipart/form-data.
  @UseInterceptors(FilesInterceptor('files'))
  create(@Body('product', ParseJSONPipe) createProductDto: CreateProductDto, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      return this.productsService.create(createProductDto, files)
    } catch (error: any) {
      return error.message;
    }
  }
  
  @Get()
  @ApiOperation({ summary: 'Obtener productos', description: 'Permite obtener una lista de productos con filtros opcionales.' })
  @ApiParam({ name: 'query', description: 'Filtros opcionales para la búsqueda de productos, como categoría, precio, etc.', example: '?category=electronics' })
  findAll(@Query() query?: Record<string, string>) {
    try {
      return this.productsService.findAll(query);
    } catch (error: any) {
      return error.message;
    }
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Obtener producto por slug', description: 'Permite obtener un producto específico por su slug.' })
  @ApiParam({ name: 'slug', description: 'Slug del producto a buscar.', example: 'laptop' })
  findBySlug(@Param('slug') slug: string) {
    try {
      return this.productsService.findBySlug(slug);
    } catch (error: any) {
      return error.message;
    }
  }

  @Get('/slug/sitemap')
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  @ApiOperation({ summary: 'Obtener todos los slugs de productos', description: 'Obtiene todos los productos disponibles por sus slugs para generar el mapa del sitio.' })
  getSitemapBySlug() {
    try {
      return this.productsService.getSitemapBySlug();
    } catch (error: any) {
      return error.message;
    }
  }

  @Patch(':id')
  @UseRoleAuthToken(Role.ADMIN)
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  @ApiOperation({ summary: 'Actualizar producto', description: 'Actualiza la información del producto identificado por su ID.' })
  @ApiParam({ name: 'id', description: 'Identificador único del producto a actualizar.' })
  @ApiConsumes('multipart/form-data')
  /**
   * Si quieres que Swagger muestre la estructura del DTO,
   * product debe referenciarse con $ref: getSchemaPath(UpdateProductDto) y
   * debes usar @ApiExtraModels(UpdateProductDto) para que el modelo se incluya en la documentación.
   */
  @ApiExtraModels(UpdateProductDto)
  @ApiBody({ 
    description: 'Datos requeridos para actualizar un producto.',
    schema: {
      type: 'object',
      properties: {
        product: {
          $ref: getSchemaPath(UpdateProductDto)
        },
        files: {
          type: 'array',
          description: 'Archivos de imagenes (opcionales) para adjuntar al producto.',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['product'],
    },
  })
  // Interceptor para manejar la carga de archivos. Se espera que los archivos se envíen en el campo 'files' del formulario multipart/form-data.
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @Param('id') id: string,
    @Body('product', ParseJSONPipe) product: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      return this.productsService.update(+id, product, files);
    } catch (error: any) {
      return error.message;
    }
  }

  @Delete(':id')
  @UseRoleAuthToken(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar producto', description: 'Elimina un producto del sistema.' })
  @ApiParam({ name: 'id', description: 'Identificador único del producto a eliminar.' })
  remove(@Param('id') id: string) {
    try {
      return this.productsService.remove(+id);
    } catch (error: any) {
      return error.message;
    }
  }
}