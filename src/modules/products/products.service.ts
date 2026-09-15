import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { AdminContext } from '../../core/auth/auth.context';
import { TenantContext } from '../../core/tenant/tenant.context';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    private readonly adminContext: AdminContext,
    private readonly tenantContext: TenantContext,
    private readonly uploadsService: UploadsService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    files: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[] | undefined;
    } = {},
  ) {
    const newProduct = this.productsRepo.create({
      ...createProductDto,
      tenant_id: this.adminContext.getAuthId(),
    });

    if (files.gallery && files.gallery.length > 0) {
      const uploadedGallery = await this.uploadsService.uploadImages(
        files.gallery,
        `products/${this.adminContext.getAuthCompany()}`,
      );
      newProduct.gallery = uploadedGallery;
    }

    if (files.image) {
      const [uploadedImage] = await this.uploadsService.uploadImages(
        files.image,
        `products/${this.adminContext.getAuthCompany()}`,
      );
      newProduct.image = uploadedImage;
    }

    await this.productsRepo.save(newProduct);

    throw new HttpException(`Se creó ${createProductDto.name}`, HttpStatus.OK);
  }

  async findAll(query: FindProductsQueryDto = new FindProductsQueryDto()) {
    // /products?q=play 5&page=1&limit=20&minPrice=100&maxPrice=1500&isActive=true&stock=true
    const page = query.page;
    const limit = query.limit;
    const search = (query.q ?? query.name ?? '').trim();
    const terms = search.split(/\s+/).filter(Boolean);
    const isActive = query.isActive ?? query.status;
    const hasStock = query.stock;
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new HttpException(
        'minPrice no puede ser mayor que maxPrice',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryBuilder = this.productsRepo
      .createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.tenant_id !== undefined) {
      queryBuilder.andWhere('product.tenant_id = :tenantId', {
        tenantId: query.tenant_id,
      });
    }

    terms.forEach((term, index) => {
      const parameter = `term${index}`;
      queryBuilder.andWhere(
        new Brackets((where) =>
          where
            .where(`product.name LIKE :${parameter}`)
            .orWhere(`product.alias LIKE :${parameter}`)
            .orWhere(`product.brand LIKE :${parameter}`)
            .orWhere(`product.model LIKE :${parameter}`)
            .orWhere(`product.description LIKE :${parameter}`),
        ),
      );
      queryBuilder.setParameter(parameter, `%${term}%`);
    });

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }
    if (hasStock !== undefined) {
      queryBuilder.andWhere(
        hasStock ? 'product.stock > 0' : 'product.stock <= 0',
      );
    }
    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Este es un método "privado" encargado de buscar productos por su ID.
  async findOne(id: number) {
    const product = await this.productsRepo.findOne({ where: { id } });
    if (!product)
      throw new HttpException(
        `Producto ${id} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    return product;
  }

  // Este es un método "interno" encargado de validar un producto mediante su ID, estado, stock y tenencia. (Service Scope).
  async validateProductForSale(
    id: number,
    requestedQuantity: number,
    tenant_id: number,
  ) {
    const product = await this.productsRepo.findOne({
      where: { id, tenant_id },
    });

    if (!product)
      throw new HttpException(
        `Producto ${id} no encontrado`,
        HttpStatus.NOT_FOUND,
      );

    // Validar que el producto esté activo
    if (!product.isActive) {
      throw new HttpException(
        `El producto "${product.name}" no está disponible`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validar que tenga stock suficiente
    if (product.stock < requestedQuantity) {
      throw new HttpException(
        `Stock insuficiente para "${product.name}". Stock disponible: ${product.stock}, solicitado: ${requestedQuantity}`,
        HttpStatus.BAD_REQUEST,
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

  // Incrementa las unidades vendidas de forma transaccional y aislada por tienda.
  async incrementSales(
    data?: { item_id: number; quantity: number }[],
    tenantId = this.tenantContext.getTenantId(),
  ) {
    if (!data?.length) return;

    const quantities = new Map<number, number>();
    for (const item of data) {
      if (!item.item_id) continue;
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new HttpException(
          'La cantidad vendida debe ser un entero positivo',
          HttpStatus.BAD_REQUEST,
        );
      }
      quantities.set(
        item.item_id,
        (quantities.get(item.item_id) ?? 0) + item.quantity,
      );
    }

    await this.productsRepo.manager.transaction(async (manager) => {
      for (const [productId, quantity] of quantities) {
        const product = await manager.findOne(Product, {
          where: { id: productId, tenant_id: tenantId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new HttpException(
            `Producto ${productId} no encontrado`,
            HttpStatus.NOT_FOUND,
          );
        }

        const current = product.performance ?? { sales: 0, rating: 5.0 };
        product.performance = {
          sales: Number(current.sales ?? 0) + quantity,
          rating: current.rating ?? 5.0,
        };
        await manager.save(Product, product);
      }
    });
  }

  // Método interno encargado de restaurar el inventario de ventas canceladas.
  async restoreCancelledProduct(
    data?: { item_id?: number; quantity: number }[],
  ) {
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

  private parseStringToArray(idsParam: string): number[] {
    let ids: number[];

    try {
      const parsedIds: unknown = JSON.parse(idsParam);

      if (
        !Array.isArray(parsedIds) ||
        parsedIds.length === 0 ||
        parsedIds.some((id) => !Number.isInteger(id) || id <= 0)
      ) {
        throw new Error();
      }

      ids = [...new Set(parsedIds as number[])];
    } catch {
      throw new HttpException(
        'El parámetro id debe ser un array JSON válido, por ejemplo [1,2,4]',
        HttpStatus.BAD_REQUEST,
      );
    }

    return ids;
  }

  // Este metodo se va utilizar en la "tienda" para cargar la pagina de un producto por el slug (nombre amigable para URL). (Controller Scope).
  async findBySlug(slug: string) {
    const product = await this.productsRepo.findOne({
      where: { slug, tenant_id: this.tenantContext.getTenantId() },
      relations: ['questions', 'reviews'],
    }); // { where: { name: Like(`%${name}%`) } }
    if (!product)
      throw new HttpException(
        'No se encontro ningún producto con ese nombre',
        HttpStatus.NOT_FOUND,
      );
    return product;
  }

  // Este metodo se va utilizar en la "tienda" para crear el sitemap de todos los productos de forma dinámica. (Controller Scope).
  async getSitemapBySlug() {
    const tenantId = this.tenantContext.getTenantId();
    const productsBySlug = await this.productsRepo.find({
      where: { isActive: true, tenant_id: tenantId },
      select: ['slug', 'image', 'updatedAt'],
    });
    return productsBySlug;
  }

  async update(
    id: number,
    data: UpdateProductDto,
    files: {
      image?: Express.Multer.File[];
      gallery?: Express.Multer.File[];
    } = {},
  ) {
    const productFound = await this.findOne(id);
    if (productFound.tenant_id !== this.adminContext.getAuthId())
      throw new HttpException('Usuario no autorizado', HttpStatus.UNAUTHORIZED);

    if (data.image?.public_id === 'temp_id') {
      data.image = undefined;
    }

    // Antes de guardar el producto, quitamos las imágenes con public_id igual a "temp_id" del array de imágenes
    if (data.gallery) {
      data.gallery = data.gallery.filter(
        (image) => image.public_id !== 'temp_id',
      );
    }

    // Antes de guardar el producto, comparamos las images del productFound con las del data para actualizar "Cloudinay"
    // Si hay imágenes en el producto encontrado, filtramos las que no están en el nuevo array de imágenes
    const mediaToDelete: string[] = [];
    if (data.image && productFound.image?.public_id !== data.image.public_id) {
      if (productFound.image) mediaToDelete.push(productFound.image.public_id);
    }
    if (data.gallery) {
      for (const image of productFound.gallery ?? []) {
        if (
          !data.gallery.some(
            (newImage) => newImage.public_id === image.public_id,
          )
        ) {
          mediaToDelete.push(image.public_id);
        }
      }
    }

    for (const publicId of mediaToDelete) {
      // Se eliminan las imagenes asociadas en Cloudinary
      await this.uploadsService.deleteImage(publicId);
    }

    if (files.image) {
      if (
        productFound.image &&
        !mediaToDelete.includes(productFound.image.public_id)
      ) {
        await this.uploadsService.deleteImage(productFound.image.public_id);
      }
      const [uploadedImage] = await this.uploadsService.uploadImages(
        files.image,
        `products/${this.adminContext.getAuthCompany()}`,
      );
      data.image = uploadedImage;
    }

    if (files.gallery?.length) {
      const uploadedGallery = await this.uploadsService.uploadImages(
        files.gallery,
        `products/${this.adminContext.getAuthCompany()}`,
      );
      data.gallery = [
        ...(data.gallery ?? productFound.gallery ?? []),
        ...uploadedGallery,
      ];
    }

    if (data.name !== undefined) {
      const slug = data.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

      await this.productsRepo.update(id, { ...data, slug });

      throw new HttpException(
        `${productFound.name} actualizado`,
        HttpStatus.OK,
      );
    }

    await this.productsRepo.update(id, data);

    throw new HttpException(`${productFound.name} actualizado`, HttpStatus.OK);
  }

  async duplicate(ids: number[]) {
    const tenantId = this.adminContext.getAuthId();

    const products = await this.productsRepo.find({
      where: { id: In(ids), tenant_id: tenantId },
    });

    if (products.length === 0) {
      throw new HttpException(
        `No se encontraron items para duplicar`,
        HttpStatus.NOT_FOUND,
      );
    }

    const duplicatedProducts = products.map(
      ({ id, createdAt, updatedAt, ...product }, index) =>
        this.productsRepo.create({
          ...product,
          name: `${product.name} (Copia ${index + 1})`,
          tenant_id: tenantId,
          image: product.image
            ? { ...product.image, public_id: `copia_${index + 1}` }
            : undefined,
          gallery: product.gallery?.map((image, imageIndex) => ({
            ...image,
            public_id: `copia_${index + 1}_${imageIndex + 1}`,
          })),
        }),
    );

    await this.productsRepo.save(duplicatedProducts);

    throw new HttpException(
      `${ids.length} item(s) duplicado(s)`,
      HttpStatus.OK,
    );
  }

  async desactive(ids: number[]) {
    const tenantId = this.adminContext.getAuthId();

    const products = await this.productsRepo.find({
      where: { id: In(ids), tenant_id: tenantId },
    });

    if (products.length === 0) {
      throw new HttpException(
        `No se encontraron items para cambiar su estado`,
        HttpStatus.NOT_FOUND,
      );
    }

    await Promise.all(
      products.map(({ id, isActive }) =>
        this.productsRepo.update(id, { isActive: !isActive }),
      ),
    );

    throw new HttpException(
      `${ids.length} item(s) actualizado(s)`,
      HttpStatus.OK,
    );
  }

  async remove(idsParam: string) {
    const ids = this.parseStringToArray(idsParam);

    const tenantId = this.adminContext.getAuthId();
    const products = await this.productsRepo.find({
      where: { id: In(ids), tenant_id: tenantId },
    });

    if (products.length !== ids.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new HttpException(
        `No se encontraron los items: ${missingIds.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.productsRepo.delete({ id: In(ids), tenant_id: tenantId });

    await Promise.all(
      products.flatMap((product) =>
        [product.image, ...(product.gallery || [])]
          .filter((image): image is { public_id: string; secure_url: string } =>
            Boolean(image),
          )
          .map((image) => this.uploadsService.deleteImage(image.public_id)),
      ),
    );

    throw new HttpException(
      `${ids.length} item(s) eliminado(s)`,
      HttpStatus.OK,
    );
  }
}
