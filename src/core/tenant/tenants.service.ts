import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../common/utils/bcrypt.util';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { UpdateTenantDto } from './dtos/update-tenant.dto';
import { TenantEntity } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async findByDomain(domain: string): Promise<TenantEntity | null> {
    return  await this.tenantRepository.findOne({
      where: { domain, isActive: true },
      select: ['id', 'email', 'name', 'company', 'private_keys']
    });
  }

  async findByApiKey(apiKey: string): Promise<TenantEntity | null> {
    return await this.tenantRepository.findOne({
      where: { access_keys: { x_api_key: apiKey }, isActive: true },
      select: ['id', 'email', 'name', 'company', 'private_keys']
    });
  }

  /**
   * Busca un tenant por ID (uso interno)
   * 
   * @param id - ID del tenant
   * @returns TenantEntity completo
   * @throws NotFoundException si no existe o no está activo
   */
  async findById(id: number): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, isActive: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  /**
   * Busca un tenant por nombre (usado en autenticación)
   * Retorna password para validación de credenciales
   * 
   * @param param - Nombre del tenant
   * @returns TenantEntity con: id, name, email, picture, role, password
   * @throws HttpException si no existe
   */
  async findOneByName(param: string): Promise<TenantEntity> {
    const user = await this.tenantRepository.findOne({
      where: {name: param},
      // Retorna solo password para autenticación
      select: ['id', 'name', 'email', 'picture', 'role', 'password'],
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
    await this.tenantRepository.find({ where:{ name: name} }).then((user) => {
      if (user.length > 0) {
        throw new HttpException(`El nombre de usuario ya exíste`, HttpStatus.BAD_REQUEST);
      }
    });
    
    // Verifica email único
    await this.tenantRepository.find(
      { where: { email }}).then((user) => {
      if (user.length > 0) {
        throw new HttpException(`El correo electrónico ya exíste`, HttpStatus.BAD_REQUEST);
      }
    });
    // continuar con la ejecución si no se encontraron usuarios con el mismo nombre o correo electrónico
    return true;
  }

  /**
   * Crea un nuevo tenant
   * ACCESO RESTRINGIDO: Solo root/admin
   * 
   * @param data - CreateTenantDto con datos del tenant
   * @returns TenantEntity creado
   * @throws HttpException si nombre/email ya existen
   */
  async create(data: CreateTenantDto) {
    // Verificamos si el usuario ya existe
    await this.verifyUnique(data.name, data.email)
    
    if(!data.password) {
      return await this.tenantRepository.save(this.tenantRepository.create(data));
    }

    // Encriptamos la contraseña con bcrypt
    const hashedPassword = await hashPassword(data.password);

    const newTenant = this.tenantRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.tenantRepository.save(newTenant);
  }

  /**
   * Actualiza un tenant existente
   * ACCESO RESTRINGIDO: Solo root/admin
   * 
   * @param id - ID del tenant a actualizar
   * @param data - UpdateTenantDto con campos a actualizar
   * @throws HttpException si nombre/email (al actualizarse) ya existen
   * @throws HttpException con mensaje de éxito
   */
  async update(id: number, data: UpdateTenantDto): Promise<void> {
    // Verificamos si el nombre y el correo electrónico son únicos
    if(data.name || data.email) await this.verifyUnique(data?.name, data?.email);

    // Si se proporciona contraseña nueva, la encriptamos
    if(data.password) {
       const hashedPassword = await hashPassword(data.password);
      
      await this.tenantRepository.update({id}, {...data, password: hashedPassword});
      
      throw new HttpException(`User successfully updated`, HttpStatus.OK);
    }

    // Actualiza otros campos
    await this.tenantRepository.update({id}, data);
    
    throw new HttpException(`User successfully updated`, HttpStatus.OK);
  }

  /**
   * Elimina un tenant (solo el registro, en realidad debería soft-delete)
   * ACCESO RESTRINGIDO: Solo root/admin
   * 
   * @param id - ID del tenant a eliminar
   * @throws HttpException con mensaje de éxito
   */
  async remove(id: number): Promise<void> {
    await this.tenantRepository.delete({id});

    throw new HttpException(`User successfully removed`, HttpStatus.OK);
  }

  /**
   * Retorna todos los tenants activos
   * NO se está usando actualmente
   * 
   * @returns Array de TenantEntity
   */
  async findAll(): Promise<TenantEntity[]> {
    return await this.tenantRepository.find({
      where: { isActive: true },
    });
  }
}