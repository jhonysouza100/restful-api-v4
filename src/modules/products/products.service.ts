import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { env } from '../../common/config/env.config';
import { AuthContextRequest } from '../../core/auth/auth.context';
import { TenantContextService } from '../../core/tenant/tenant.context';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    private readonly authContextRequest: AuthContextRequest,
    private readonly tenantContextService: TenantContextService,
    private readonly uploadsService: UploadsService
  ) { }

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      const uploadedImages = await this.uploadsService.uploadImages(files, `products/${this.tenantContextService.getTenantCompany()}`);
      createProductDto.images = uploadedImages;
    }

    const newProduct = this.productsRepo.create({ ...createProductDto, tenant_id: this.authContextRequest.getAuthId() });

    await this.productsRepo.save(newProduct);

    throw new HttpException(`Se creó ${createProductDto.name}`, HttpStatus.OK);
  }

  async findAll(query: Record<string, string> = {}) {
    const ITEMS_PER_PAGE = env.ITEMS_PER_PAGE; // Número de elementos por página
    // Desestructuramos los parámetros de la query
    const { page, tenant_id, status, stock, ...filters } = query;
    // Se asegura de que `page` tenga un valor por defecto de 1
    const pageNumber = parseInt(page) > 0 ? parseInt(page) : 1;

    try {
      // Si no se pasan filtros de busqueda
      if (!query) {
        const [products, count] = await this.productsRepo.findAndCount({
          skip: ITEMS_PER_PAGE * (pageNumber - 1),
          take: ITEMS_PER_PAGE,
        });
        if (products.length === 0) {
          throw new HttpException('No se encontro ningún producto', HttpStatus.NOT_FOUND);
        }
        return { products, count };
      }

      // Construimos las condiciones de búsqueda dinámicamente a partir de los parámetros de la query
      const whereConditions = filters
        ? Object.entries(filters).reduce((acc, [key, value]) => {
          acc[key] = Like(`%${value}%`); // Búsqueda por valor parcial
          return acc;
        }, {} as Record<string, any>)
        : {};

      // Agregar condición exacta para el status si se pasó
      if (status !== undefined) {
        whereConditions['status'] = status === 'true';
        whereConditions['stock'] = MoreThanOrEqual(1);
      }

      if (tenant_id !== undefined) {
        whereConditions['tenant_id'] = tenant_id;
      }

      // Realizamos la búsqueda con las condiciones dinámicas
      const [products, count] = await this.productsRepo.findAndCount({
        where: whereConditions,
        skip: ITEMS_PER_PAGE * (pageNumber - 1), // Paginación
        take: ITEMS_PER_PAGE, // Limitamos los resultados por página
      });

      if (products.length === 0) {
        throw new HttpException('No se encontro ningún producto', HttpStatus.NOT_FOUND);
      }

      return { products, count };
    } catch (error: any) {
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  // Este es un método "privado" encargado de buscar productos por su ID.
  async findOne(id: number) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product) throw new HttpException(`Producto ${id} no encontrado`, HttpStatus.NOT_FOUND);
    return product;
  }

  // Este es un método "interno" encargado de validar un producto mediante su ID, estado, stock y tenencia. (Service Scope).
  async validateProductForSale(id: number, requestedQuantity: number, tenant_id: number) {
    const product = await this.productsRepo.findOne({ where: { id, tenant_id } });

    if (!product) throw new HttpException(`Producto ${id} no encontrado`, HttpStatus.NOT_FOUND);

    // Validar que el producto esté activo
    if (!product.isActive) {
      throw new HttpException(`El producto "${product.name}" no está disponible`, HttpStatus.BAD_REQUEST);
    }

    // Validar que tenga stock suficiente
    if (product.stock < requestedQuantity) {
      throw new HttpException(
        `Stock insuficiente para "${product.name}". Stock disponible: ${product.stock}, solicitado: ${requestedQuantity}`,
        HttpStatus.BAD_REQUEST
      );
    }

    return product;
  }

  // Método interno encargado de descontar el inventario.
  async subtractSoldProduct(data?: { item_id?: number; quantity: number }[]) {
    if (!data?.length) return;

    await Promise.all(
      data.map(async (itemSold) => {
        // Si el item no posee ID, este puede ser un envio.
        if (!itemSold.item_id) return;

        const product = await this.findOne(itemSold.item_id);

        const newStock = product.stock - itemSold.quantity;

        await this.productsRepo.update(
          { id: product.id },
          {
            stock: newStock,
            isActive: newStock > 0,
          },
        );
      }),
    );
  }

  // Método interno encargado de restaurar el inventario de ventas canceladas.
  async restoreCancelledProduct(data?: { item_id?: number; quantity: number }[]) {
    if (!data?.length) return;

    await Promise.all(
      data.map(async (itemSold) => {
        // Si el item no posee ID, puede tratarse de un envío.
        if (!itemSold.item_id) return;

        const product = await this.findOne(itemSold.item_id);

        const restoredStock = product.stock + itemSold.quantity;

        await this.productsRepo.update(
          { id: product.id },
          {
            stock: restoredStock,
            isActive: restoredStock > 0,
          },
        );
      }),
    );
  }

  // Este metodo se va utilizar en la "tienda" para cargar la pagina de un producto por el slug (nombre amigable para URL). (Controller Scope).
  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({ where: { slug }, relations: ['questions', 'reviews'] }); // { where: { name: Like(`%${name}%`) } }
    if (!product) throw new HttpException('No se encontro ningún producto con ese nombre', HttpStatus.NOT_FOUND);
    return product;
  }

  // Este metodo se va utilizar en la "tienda" para crear el sitemap de todos los productos de forma dinámica. (Controller Scope).
  async getSitemapBySlug() {
    const tenantId = this.tenantContextService.getTenantId();
    const productsBySlug = await this.productsRepo.find({ where: { isActive: true, tenant_id: tenantId }, select: ['slug', 'images', 'updatedAt'] });
    return productsBySlug;
  }

  async update(id: number, data: UpdateProductDto, files: Express.Multer.File[]) {
    const productFound = await this.findOne(id);
    if (productFound.tenant_id !== this.authContextRequest.getAuthId()) throw new HttpException('Usuario no autorizado', HttpStatus.UNAUTHORIZED);

    // Antes de guardar el producto, quitamos las imágenes con public_id igual a "temp_id" del array de imágenes
    if (data.images) {
      data.images = data.images.filter((image) => image.public_id !== "temp_id");
    }

    // Antes de guardar el producto, comparamos las images del productFound con las del data para actualizar "Clodinay"
    // Si hay imágenes en el producto encontrado, filtramos las que no están en el nuevo array de imágenes
    if (productFound.images) {
      const imagesToDelete = productFound.images.filter((image) => {
        return !data.images?.some((newImage) => newImage.public_id === image.public_id);
      });

      for (const image of imagesToDelete) {
        // Se eliminan las imagenes asociadas en Cloudinary
        await this.uploadsService.deleteImage(image.public_id);
      }
    }

    // Actualizamos el producto con los nuevos datos
    await this.productsRepo.update(id, data);

    if (files && files.length > 0) {
      const uploadedImages = await this.uploadsService.uploadImages(files, `products/${this.tenantContextService.getTenantCompany()}`);
      // A las imagenes filtradas, las concatenamos con las nuevas
      const newImages = data.images ? [...data.images, ...uploadedImages] : uploadedImages;
      // Actualizamos el producto con las nuevas imágenes
      await this.productsRepo.update(id, { images: newImages });
    }

    throw new HttpException(`${productFound.name} has been updated`, HttpStatus.OK);
  }

  async remove(id: number) {
    const productFound = await this.findOne(id);
    if (productFound.tenant_id !== this.authContextRequest.getAuthId()) throw new HttpException('Usuario no autorizado', HttpStatus.UNAUTHORIZED);
    await this.productsRepo.delete(id);
    for (const image of productFound.images || []) {
      // Se eliminan las imagenes asociadas en Cloudinary
      await this.uploadsService.deleteImage(image.public_id);
    }
    throw new HttpException(`Se eliminó ${productFound.name} has been removed`, HttpStatus.OK);
  }
}
