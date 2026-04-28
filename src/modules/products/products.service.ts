import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { env } from '../../common/config/env.config';
import { Like, MoreThanOrEqual, Repository } from 'typeorm';
import { AuthContextRequest } from '../../core/auth/auth.context';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    private readonly authContextRequest: AuthContextRequest,
    private readonly uploadsService: UploadsService
  ) {}

  async create(createProductDto: CreateProductDto, files: Express.Multer.File[]) {
    if (files && files.length > 0) {
      const uploadedImages = await this.uploadsService.uploadImages(files);
      createProductDto.images = uploadedImages;
    }

    const newProduct = this.productsRepo.create({...createProductDto, tenant_id: this.authContextRequest.getAuthId()});

    await this.productsRepo.save(newProduct);

    throw new HttpException(`Se creó ${createProductDto.name}`, HttpStatus.OK);
  }

  async findAll(query: Record<string, string> = {}) {
    const ITEMS_PER_PAGE = env.ITEMS_PER_PAGE; // Número de elementos por página
    // Desestructuramos los parámetros de la query
    const { page, tenant_id, status, stock, ...filters } = query;
    // Se asegura de que `page` tenga un valor por defecto de 1
    const pageNumber = page && parseInt(page) > 0 ? parseInt(page) : 1;

    try {
      // Si no se pasan filtros de busqueda
      if (!query || Object.keys(query).length === 0) {
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
    } catch (error) {
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
