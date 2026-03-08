import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantEntity } from '../entities/tenant.entity';
import { hashPassword } from 'src/common/utils/bcrypt';
import { CreateTenantDto, UpdateTenantDto } from '../dtos/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(TenantEntity)
    private readonly tenantRepository: Repository<TenantEntity>,
  ) {}

  async findByDomain(domain: string): Promise<TenantEntity | null> {
    return  await this.tenantRepository.findOne({
      where: { domain, isActive: true },
      select: ['id', 'email', 'name', 'spreadsheets', 'mercadopago', 'company']
    });
  }

  async findByApiKey(apiKey: string): Promise<TenantEntity | null> {
    return await this.tenantRepository.findOne({
      where: { apiKey, isActive: true },
      select: ['id', 'email', 'name', 'spreadsheets', 'mercadopago', 'company']
    });
  }

  async findById(id: number): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findOne({
      where: { id, isActive: true },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  // Para la Authenticación
  async findByName(param: string) {
    const user = await this.tenantRepository.findOne({
      where: {name: param},
      // returning only the password for authentication
      select: ['id', 'name', 'email', 'picture', 'role', 'password'],
    });
    if (!user) {
      throw new HttpException(`Usuario no encontrado`, HttpStatus.NOT_FOUND);
    }
    return user;
  }
  
  private async verifyUnique(name?: string, email?: string) {
    await this.tenantRepository.find({ where:{ name: name} }).then((user) => {
      if (user.length > 0) {
        throw new HttpException(`El nombre de usuario ya exíste`, HttpStatus.BAD_REQUEST);
      }
    });
    await this.tenantRepository.find(
      { where: { email: { user: email }} }).then((user) => {
      if (user.length > 0) {
        throw new HttpException(`El correo electrónico ya exíste`, HttpStatus.BAD_REQUEST);
      }
    });
    // continuar con la ejecución si no se encontraron usuarios con el mismo nombre o correo electrónico
    return true;
  }

  // Only root access to create tenants
  async create(data: CreateTenantDto) {
    // Verificomos si el usuario ya existe
    await this.verifyUnique(data.name, data.email.user)
    // encryptamos el password
    const hashedPassword = await hashPassword(data.password);

    const newTenant = this.tenantRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.tenantRepository.save(newTenant);
  }

  // Only root access to update tenants
  async update(id: number, data: UpdateTenantDto): Promise<void> {
    // Verificamos si el nombre y el correo electrónico son únicos
    if(data.name || data.email) await this.verifyUnique(data?.name, data?.email?.user);

    // Si se proporciona, Encriptamos la contraseña
    if(data.password) {
       const hashedPassword = await hashPassword(data.password);
      
      await this.tenantRepository.update({id}, {...data, password: hashedPassword});
      
      throw new HttpException(`User successfully updated`, HttpStatus.OK);
    }

    await this.tenantRepository.update({id}, data);
    
    throw new HttpException(`User successfully updated`, HttpStatus.OK);
  }

  // Only root access to create tenants
  async remove(id: number): Promise<void> {
    await this.tenantRepository.delete({id});

    throw new HttpException(`User successfully removed`, HttpStatus.OK);
  }

  // No se esta usando
  async findAll(): Promise<TenantEntity[]> {
    return await this.tenantRepository.find({
      where: { isActive: true },
    });
  }

}