import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Raw, Repository } from 'typeorm';
import { AutenticationContext } from '../auth/auth.context';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { RootUpdateCompanyDto } from './dtos/update-company.dto';
import { CompanyEntity } from './entities/company.entity';

type MySqlDriverError = Error & { code?: string };

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    private readonly autenticationContext: AutenticationContext,
  ) {}

  /**
   * Busca una compañía por su dominio para resolver el tenant.
   *
   * @param domain Dominio exacto de la compañía.
   * @returns Los datos requeridos para el tenant, o null si no hay coincidencia.
   */
  async findByDomain(domain: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: { domain },
      select: ['id', 'email', 'name', 'private_keys', 'domain'],
    });
  }

  /**
   * Busca una compañía por su clave API para resolver el tenant.
   *
   * @param apiKey Clave API presentada por el cliente.
   * @returns Los datos requeridos para el tenant, o null si no hay coincidencia.
   */
  async findByApiKey(apiKey: string): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: {
        access_keys: Raw(
          (alias) =>
            `JSON_UNQUOTE(JSON_EXTRACT(${alias}, '$.x_api_key')) = :apiKey`,
          { apiKey },
        ),
      },
      select: ['id', 'email', 'name', 'private_keys', 'domain'],
    });
  }

  /**
   * Lista todas las compañías del administrador autenticado, incluidas las que
   * aún no están verificadas. El índice de administrador permite filtrar las
   * compañías asociadas y solo se seleccionan los campos públicos requeridos.
   *
   * @returns Compañías con id, imagen, nombre, dominio y correo de contacto.
   */
  async findAllByAdmin(): Promise<
    Array<
      Pick<
        CompanyEntity,
        'id' | 'picture' | 'name' | 'domain' | 'email' | 'verified'
      >
    >
  > {
    return this.companyRepository
      .createQueryBuilder('company')
      .select([
        'company.id',
        'company.picture',
        'company.name',
        'company.domain',
        'company.email',
        'company.verified',
      ])
      .where('company.admin_id = :adminId', {
        adminId: this.autenticationContext.getAdminId(),
      })
      .getMany();
  }

  /**
   * Busca una compañía del administrador autenticado por su identificador.
   * MySQL puede usar la clave primaria de id y comprobar admin_id para validar
   * la pertenencia, sin forzar un índice que podría ser menos selectivo.
   *
   * @param id Identificador numérico de la compañía.
   * @returns La entidad completa de la compañía encontrada.
   * @throws NotFoundException si no existe o pertenece a otro administrador.
   */
  async findOneByAdmin(id: number): Promise<CompanyEntity> {
    const company = await this.companyRepository
      .createQueryBuilder('company')
      .where('company.id = :id', { id })
      .andWhere('company.admin_id = :adminId', {
        adminId: this.autenticationContext.getAdminId(),
      })
      .getOne();

    if (!company) {
      throw new UnauthorizedException(`Company not found for admin`);
    }

    return company;
  }

  /**
   * Busca una compañía por el identificador de usuario de Mercado Pago.
   *
   * @param userId Identificador del usuario registrado en Mercado Pago.
   * @returns La compañía encontrada, o null si no hay coincidencia.
   */
  async findByMercadopagoUserId(
    userId?: string,
  ): Promise<CompanyEntity | null> {
    return await this.companyRepository.findOne({
      where: {
        access_keys: Raw(
          (alias) =>
            `JSON_UNQUOTE(JSON_EXTRACT(${alias}, '$.mercadopago_user_id')) = :userId`,
          { userId },
        ),
      },
      select: ['id', 'email', 'name', 'private_keys', 'domain'],
    });
  }

  /**
   * Busca una compañía por su identificador para uso interno.
   *
   * @param id Identificador numérico de la compañía.
   * @returns La entidad completa de la compañía encontrada.
   * @throws NotFoundException si no existe.
   */
  async findOneById(id: number): Promise<CompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  /**
   * Comprueba los campos únicos enviados y puede excluir la compañía actual.
   *
   * @param data Campos únicos incluidos en la operación.
   * @param excludeId ID de la compañía que se excluye al actualizar.
   * @throws ConflictException cuando otro registro ya usa alguno de los valores.
   */
  private async verifyUnique(
    data: Partial<Pick<CreateCompanyDto, 'name' | 'email' | 'domain'>>,
    excludeId?: number,
  ): Promise<void> {
    const uniqueFields = [
      ['name', data.name, 'nombre'],
      ['email', data.email, 'correo electrónico'],
      ['domain', data.domain, 'dominio'],
    ] as const;

    for (const [field, value, label] of uniqueFields) {
      if (value === undefined || value === null) {
        continue;
      }

      const query = this.companyRepository
        .createQueryBuilder('company')
        .where(`company.${field} = :value`, { value });

      if (excludeId !== undefined) {
        query.andWhere('company.id != :excludeId', { excludeId });
      }

      if (await query.getExists()) {
        throw new ConflictException(`Ya existe una compañía con ese ${label}`);
      }
    }
  }

  /**
   * Traduce colisiones de índices únicos de MySQL a HTTP 409 y propaga cualquier
   * otro error sin ocultarlo.
   *
   * @param error Error producido por la escritura en la base de datos.
   * @throws ConflictException si MySQL reporta ER_DUP_ENTRY.
   * @throws El error original cuando no es una colisión de unicidad.
   */
  private rethrowDuplicateKeyAsConflict(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as MySqlDriverError).code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(
        'El nombre, correo o dominio de la compañía ya está registrado',
      );
    }

    throw error;
  }

  /**
   * Crea una compañía y la vincula al administrador de la petición actual.
   *
   * @param data Datos validados de la nueva compañía.
   * @returns La entidad de compañía guardada.
   * @throws HttpException si el nombre o correo se consideran duplicados.
   */
  async create(data: CreateCompanyDto) {
    await this.verifyUnique(data);

    const companyData = {
      ...data,
      admin: { id: this.autenticationContext.getAdminId() },
    };

    try {
      return await this.companyRepository.save(companyData);
    } catch (error: unknown) {
      this.rethrowDuplicateKeyAsConflict(error);
    }
  }

  /**
   * Actualiza una compañía perteneciente al administrador autenticado.
   *
   * @param id Identificador numérico de la compañía.
   * @param data Campos validados que se desean actualizar.
   * @returns No devuelve valor; actualmente comunica el éxito mediante una
   *          HttpException con estado HTTP 200.
   * @throws NotFoundException si la compañía no pertenece al administrador o no existe.
   * @throws HttpException si la validación de unicidad detecta un conflicto.
   */
  async rootUpdate(id: number, data: RootUpdateCompanyDto): Promise<void> {
    await this.findOneByAdmin(id);

    await this.verifyUnique(data, id);

    try {
      await this.companyRepository.update({ id }, data);
    } catch (error: unknown) {
      this.rethrowDuplicateKeyAsConflict(error);
    }

    throw new HttpException(`Datos actualizados con éxito`, HttpStatus.OK);
  }
}
