import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { CompaniesService } from '../../core/company/companies.service';
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
    private readonly companiesService: CompaniesService,
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
    const company = await this.companiesService.findOneByAdmin(createProductDto.company_id);
    const newProduct = this.productsRepo.create({
      ...createProductDto,
      company: { id: company.id },
    });

    if (files.gallery && files.gallery.length > 0) {
      const uploadedGallery = await this.uploadsService.uploadImages(
        files.gallery,
        `products/${company.name}`,
      );
      newProduct.gallery = uploadedGallery;
    }

    if (files.image) {
      const [uploadedImage] = await this.uploadsService.uploadImages(
        files.image,
        `products/${company.name}`,
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
    const topic = query.topic?.trim();
    const terms = search.split(/\s+/).filter(Boolean);
    const id = query.id;
    const isActive = query.isActive;
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
      .orderBy('product.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.tenant_id !== undefined) {
      queryBuilder
        .innerJoin('product.company', 'company')
        .andWhere('company.id = :companyId', {
          companyId: query.tenant_id,
        });
    }

    if (topic) {
      queryBuilder.andWhere('product.topic LIKE :topic', {
        topic: `%${topic}%`,
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
    
    if (id !== undefined) {
      queryBuilder.andWhere('product.id = :id', { id });
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
      count: {
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
  async findOne(id: number, companyId: number) {
    const product = await this.productsRepo.findOne({
      where: { id, company: { id: companyId } },
    });
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
      where: { id, company: { id: tenant_id } },
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
  async subtractSoldProduct(
    data: { item_id?: number; quantity: number }[] | undefined,
    companyId: number,
  ) {
    if (!data?.length) return;

    const quantities = this.getProductQuantities(data);
    await this.productsRepo.manager.transaction(async (manager) => {
      for (const [productId, quantity] of quantities) {
        // Decremento condicional y aritmético en la base de datos: evita
        // sobreventa y actualizaciones perdidas ante operaciones concurrentes.
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => 'COALESCE(stock, 0) - :quantity' })
          .where('id = :productId')
          .andWhere('tenant_id = :companyId')
          .andWhere('COALESCE(stock, 0) >= :quantity')
          .setParameters({ productId, companyId, quantity })
          .execute();

        if (result.affected === 0) {
          await this.ensureProductExists(productId, companyId, manager);
          throw new HttpException(
            `Stock insuficiente para el producto ${productId}`,
            HttpStatus.CONFLICT,
          );
        }

        // Se ejecuta después del decremento, dentro de la misma transacción,
        // para que el estado refleje el stock ya actualizado.
        await manager
          .createQueryBuilder()
          .update(Product)
          .set({ isActive: () => 'COALESCE(stock, 0) > 0' })
          .where('id = :productId')
          .andWhere('tenant_id = :companyId')
          .setParameters({ productId, companyId })
          .execute();
      }
    });
  }

  private getProductQuantities(
    data: { item_id?: number; quantity: number }[],
  ): Map<number, number> {
    const quantities = new Map<number, number>();
    for (const item of data) {
      // Items sin ID representan conceptos como el envío.
      if (!item.item_id) continue;
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new HttpException(
          'La cantidad debe ser un entero positivo',
          HttpStatus.BAD_REQUEST,
        );
      }
      quantities.set(
        item.item_id,
        (quantities.get(item.item_id) ?? 0) + item.quantity,
      );
    }
    return quantities;
  }

  private async ensureProductExists(
    productId: number,
    companyId: number,
    manager: Repository<Product>['manager'],
  ): Promise<void> {
    const productExists = await manager.getRepository(Product).exists({
      where: { id: productId, company: { id: companyId } },
    });
    if (!productExists) {
      throw new HttpException(
        `Producto ${productId} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Incrementa las unidades vendidas de forma transaccional y aislada por tienda.
  async incrementSales(
    data?: { item_id: number; quantity: number }[],
    companyId = this.tenantContext.getCompanyId(),
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
          where: { id: productId, company: { id: companyId } },
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
    data: { item_id?: number; quantity: number }[] | undefined,
    companyId: number,
  ) {
    if (!data?.length) return;

    const quantities = this.getProductQuantities(data);
    await this.productsRepo.manager.transaction(async (manager) => {
      for (const [productId, quantity] of quantities) {
        const result = await manager
          .createQueryBuilder()
          .update(Product)
          .set({ stock: () => 'COALESCE(stock, 0) + :quantity' })
          .where('id = :productId')
          .andWhere('tenant_id = :companyId')
          .setParameters({ productId, companyId, quantity })
          .execute();

        if (result.affected === 0) {
          await this.ensureProductExists(productId, companyId, manager);
          throw new HttpException(
            `No se pudo restaurar el stock del producto ${productId}`,
            HttpStatus.CONFLICT,
          );
        }

        await manager
          .createQueryBuilder()
          .update(Product)
          .set({ isActive: () => 'COALESCE(stock, 0) > 0' })
          .where('id = :productId')
          .andWhere('tenant_id = :companyId')
          .setParameters({ productId, companyId })
          .execute();
      }
    });
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
      where: { slug, company: { id: this.tenantContext.getCompanyId() } },
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
    const companyId = this.tenantContext.getCompanyId();
    const productsBySlug = await this.productsRepo.find({
      where: { isActive: true, company: { id: companyId } },
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
    const company = await this.companiesService.findOneByAdmin(data.company_id);
    const productFound = await this.productsRepo.findOne({
      where: { id, company: { id: data.company_id } },
    });
    if (!productFound) {
      throw new HttpException(
        `Producto ${id} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (data.image?.public_id === 'temp_id') {
      data.image = undefined;
    }

    // Antes de guardar el producto, quitamos las imágenes con public_id igual a "temp_id" del array de imágenes
    if (data.gallery) {
      data.gallery = data.gallery.filter(
        (image) => image.public_id !== 'temp_id',
      );
    }

    /** Array de "public_id" que se quieren mandar a eliminar */
    let mediaToDelete: string[] = []; 
    // Comparamos las images del productFound con las del dto para actualizar "Cloudinay"
    // Filtramos: Comparamos las imagenes que vienen por el DTO con las del producto, guardamos las que no esten en el DTO.
    if (data.image && productFound.image?.public_id !== data.image.public_id) {
      if (productFound.image) mediaToDelete.push(productFound.image.public_id);
    }
    if (data.gallery) {
      for (const productFoundGalleryImage of productFound.gallery ?? []) {
        if (!data.gallery.some((dtoImage) => dtoImage.public_id === productFoundGalleryImage.public_id)) {
          mediaToDelete.push(productFoundGalleryImage.public_id);
        }
      }
    }
    if(data.gallery === undefined) {
      for (const productFoundImage of productFound.gallery ?? []) {
        mediaToDelete.push(productFoundImage.public_id);
      }
      data.gallery = [];
    }
    
    // Las imágenes duplicadas usan public_id ficticios "copia_" y no deben mandarse a eliminar de Cloudinary, pero si, No deben incluirse en la data de galeria.
    mediaToDelete = mediaToDelete.filter((publicId) => !publicId.includes('copia_'),);

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
        `products/${company.name}`,
      );
      data.image = uploadedImage;
    }

    if (files.gallery?.length) {
      const uploadedGallery = await this.uploadsService.uploadImages(
        files.gallery,
        `products/${company.name}`,
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

      await this.productsRepo.update(
        { id, company: { id: company.id } },
        { ...data, slug },
      );

      throw new HttpException(
        `${productFound.name} actualizado`,
        HttpStatus.OK,
      );
    }

    await this.productsRepo.update({ id, company: { id: company.id } }, data);

    throw new HttpException(`${productFound.name} actualizado`, HttpStatus.OK);
  }

  async duplicate(ids: number[]) {
    const companies = await this.companiesService.findAllByAdmin();
    const companyIds = companies.map(({ id }) => id);
    if (companyIds.length === 0) {
      throw new HttpException(
        'No se encontraron items para duplicar',
        HttpStatus.NOT_FOUND,
      );
    }

    // El ID del administrador no es el ID de la compañía. Filtramos por
    // compañías propias y obtenemos solo el ID de la relación para duplicarla
    // sin cargar las credenciales de CompanyEntity.
    const { entities: products, raw } = await this.productsRepo
      .createQueryBuilder('product')
      .innerJoin('product.company', 'company')
      .addSelect('company.id', 'companyId')
      .where('product.id IN (:...ids)', { ids })
      .andWhere('company.id IN (:...companyIds)', { companyIds })
      .getRawAndEntities();

    if (products.length === 0) {
      throw new HttpException(
        `No se encontraron items para duplicar`,
        HttpStatus.NOT_FOUND,
      );
    }

    const duplicatedProducts = products.map((sourceProduct, index) => {
      const { id, createdAt, updatedAt, ...product } = sourceProduct;
      // Estos campos se excluyen deliberadamente de la copia.
      void id;
      void createdAt;
      void updatedAt;
      const companyId = Number(
        (raw[index] as { companyId: number | string }).companyId,
      );

      return this.productsRepo.create({
        ...product,
        name: `${product.name} (Copia ${index + 1})`,
        company: { id: companyId },
        image: product.image
          ? { ...product.image, public_id: `copia_${index + 1}` }
          : undefined,
        gallery: product.gallery?.map((image, imageIndex) => ({
          ...image,
          public_id: `copia_${index + 1}_${imageIndex + 1}`,
        })),
      });
    });

    await this.productsRepo.save(duplicatedProducts);

    throw new HttpException(
      `${ids.length} item(s) duplicado(s)`,
      HttpStatus.OK,
    );
  }

  async desactive(ids: number[]) {
    const companies = await this.companiesService.findAllByAdmin();
    const companyIds = companies.map(({ id }) => id);
    if (companyIds.length === 0) {
      throw new HttpException(
        'No se encontraron items para cambiar su estado',
        HttpStatus.NOT_FOUND,
      );
    }

    const { entities: products, raw } = await this.productsRepo
      .createQueryBuilder('product')
      .innerJoin('product.company', 'company')
      .addSelect('company.id', 'companyId')
      .where('product.id IN (:...ids)', { ids })
      .andWhere('company.id IN (:...companyIds)', { companyIds })
      .getRawAndEntities();

    if (products.length === 0) {
      throw new HttpException(
        `No se encontraron items para cambiar su estado`,
        HttpStatus.NOT_FOUND,
      );
    }

    await Promise.all(
      products.map(({ id, isActive }, index) => {
        const companyId = Number(
          (raw[index] as { companyId: number | string }).companyId,
        );
        return this.productsRepo.update(
          { id, company: { id: companyId } },
          { isActive: !isActive },
        );
      }),
    );

    throw new HttpException(
      `${ids.length} item(s) actualizado(s)`,
      HttpStatus.OK,
    );
  }

  async remove(idsParam: string, companyId: number) {
    await this.companiesService.findOneByAdmin(companyId);
    const ids = this.parseStringToArray(idsParam);

    const products = await this.productsRepo.find({
      where: { id: In(ids), company: { id: companyId } },
    });

    if (products.length !== ids.length) {
      const foundIds = new Set(products.map((product) => product.id));
      const missingIds = ids.filter((id) => !foundIds.has(id));
      throw new HttpException(
        `No se encontraron los items: ${missingIds.join(', ')}`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.productsRepo.delete({
      id: In(ids),
      company: { id: companyId },
    });

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
