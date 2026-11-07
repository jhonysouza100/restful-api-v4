import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { hashPassword } from '../../common/utils/bcrypt.util';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { CompanyEntity } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async findByDomain(domain: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: { domain, isActive: true },
      select: [
        'id',
        'email',
        'name',
        'company',
        'private_keys',
        'domain',
        'fullName',
      ],
    });
  }

  async findByApiKey(apiKey: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: {
        isActive: true,
        access_keys: Raw(
          (alias) =>
            `JSON_UNQUOTE(JSON_EXTRACT(${alias}, '$.x_api_key')) = :apiKey`,
          { apiKey },
        ),
      },
      select: [
        'id',
        'email',
        'name',
        'company',
        'private_keys',
        'domain',
        'fullName',
      ],
    });
  }

  async findByMercadopagoUserId(userId?: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: {
        isActive: true,
        access_keys: Raw(
          (alias) =>
            `JSON_UNQUOTE(JSON_EXTRACT(${alias}, '$.mercadopago_user_id')) = :userId`,
          { userId },
        ),
      },
      select: [
        'id',
        'email',
        'name',
        'company',
        'private_keys',
        'domain',
        'fullName',
      ],
    });
  }

  /**
   * Busca un company por ID (uso interno)
   *
   * @param id - ID del company
   * @returns CompanyEntity completo
   * @throws NotFoundException si no existe o no está activo
   */
  async findById(id: number): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { id, isActive: true },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  /**
   * Busca un company por nombre (usado en autenticación)
   * Retorna password para validación de credenciales
   *
   * @param param - Nombre del company
   * @returns CompanyEntity con: id, name, email, picture, role, password
   * @throws HttpException si no existe
   */
  async findOneByName(param: string): Promise<CompanyEntity> {
    const user = await this.companyRepository.findOne({
      where: { name: param },
      // Retorna solo password para autenticación
      select: ['id', 'name', 'email', 'picture', 'role', 'password', 'company'],
    });
    if (!user) {
      throw new HttpException(`Usuario no encontrado`, HttpStatus.NOT_FOUND);
    }
    return user;
  }

  /**
   * Verifica que nombre y email sean únicos
   *
   * @param name - Nombre a validar
   * @param email - Email a validar
   * @throws HttpException si ya existen
   */
  private async verifyUnique(name?: string, email?: string) {
    // Verifica nombre único
    await this.companyRepository.find({ where: { name: name } }).then((user) => {
      if (user.length > 0) {
        throw new HttpException(
          `El nombre de usuario ya exíste`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    // Verifica email único
    await this.companyRepository.find({ where: { email } }).then((user) => {
      if (user.length > 0) {
        throw new HttpException(
          `El correo electrónico ya exíste`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });
    // continuar con la ejecución si no se encontraron usuarios con el mismo nombre o correo electrónico
    return true;
  }

  /**
   * Crea un nuevo company
   * ACCESO RESTRINGIDO: Solo root/admin
   *
   * @param data - CreateCompanyDto con datos del company
   * @returns CompanyEntity creado
   * @throws HttpException si nombre/email ya existen
   */
  async create(data: CreateCompanyDto) {
    // Verificamos si el usuario ya existe
    await this.verifyUnique(data.name, data.email);

    if (!data.password) {
      return await this.companyRepository.save(
        this.companyRepository.create(data),
      );
    }

    // Encriptamos la contraseña con bcrypt
    const hashedPassword = await hashPassword(data.password);

    const newCompany = this.companyRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.companyRepository.save(newCompany);
  }

  /**
   * Actualiza un company existente
   * ACCESO RESTRINGIDO: Solo root/admin
   *
   * @param id - ID del company a actualizar
   * @param data - UpdateCompanyDto con campos a actualizar
   * @throws HttpException si nombre/email (al actualizarse) ya existen
   * @throws HttpException con mensaje de éxito
   */
  async update(id: number, data: UpdateCompanyDto): Promise<void> {
    // Verificamos si el nombre y el correo electrónico son únicos
    if (data.name || data.email)
      await this.verifyUnique(data?.name, data?.email);

    // Si se proporciona contraseña nueva, la encriptamos
    if (data.password) {
      const hashedPassword = await hashPassword(data.password);

      await this.companyRepository.update(
        { id },
        { ...data, password: hashedPassword },
      );

      throw new HttpException(`User successfully updated`, HttpStatus.OK);
    }

    // Actualiza otros campos
    await this.companyRepository.update({ id }, data);

    throw new HttpException(`User successfully updated`, HttpStatus.OK);
  }

  /**
   * Elimina un company (solo el registro, en realidad debería soft-delete)
   * ACCESO RESTRINGIDO: Solo root/admin
   *
   * @param id - ID del company a eliminar
   * @throws HttpException con mensaje de éxito
   */
  async remove(id: number): Promise<void> {
    await this.companyRepository.delete({ id });

    throw new HttpException(`User successfully removed`, HttpStatus.OK);
  }

  /**
   * Retorna todos los companies activos
   * NO se está usando actualmente
   *
   * @returns Array de CompanyEntity
   */
  async findAll(): Promise<CompanyEntity[]> {
    return await this.companyRepository.find({
      where: { isActive: true },
    });
  }
}
