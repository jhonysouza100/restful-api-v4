import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../../common/utils/bcrypt.util';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminEntity } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async findById(id: number): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({
      where: { id, isActive: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  async findOneByUsername(username: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'role', 'picture', 'isActive'],
    });

    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    return admin;
  }

  private async verifyUnique(username: string, id?: number): Promise<void> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { username },
    });

    if (existingAdmin && existingAdmin.id !== id) {
      throw new HttpException(
        'El nombre de usuario ya existe',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(data: CreateAdminDto): Promise<AdminEntity> {
    await this.verifyUnique(data.username);

    const admin = this.adminRepository.create({
      ...data,
      password: await hashPassword(data.password),
    });

    return this.adminRepository.save(admin);
  }

  async update(id: number, data: UpdateAdminDto): Promise<void> {
    await this.findById(id);

    if (data.username) {
      await this.verifyUnique(data.username, id);
    }

    const updateData = {
      ...data,
      ...(data.password
        ? { password: await hashPassword(data.password) }
        : {}),
    };

    await this.adminRepository.update({ id }, updateData);
    throw new HttpException('Admin successfully updated', HttpStatus.OK);
  }

  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    throw new HttpException('Admin successfully removed', HttpStatus.OK);
  }

  async findAll(): Promise<AdminEntity[]> {
    return this.adminRepository.find({
      where: { isActive: true },
    });
  }
}
