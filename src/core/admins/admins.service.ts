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

  /**
   * Busca un administrador por su identificador.
   *
   * @param id Identificador numérico del administrador.
   * @returns El administrador encontrado.
   * @throws NotFoundException cuando no existe.
   */
  async findOneById(id: number): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({
      where: { id },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    return admin;
  }

  /**
   * Busca una cuenta por nombre de usuario y carga su contraseña para validar
   * las credenciales durante el inicio de sesión.
   *
   * @param username Nombre de usuario exacto.
   * @returns La cuenta con sus datos de autenticación seleccionados.
   * @throws NotFoundException cuando no existe una cuenta con ese nombre.
   */
  async findOneByUsername(username: string): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({
      where: { username },
      select: ['id', 'username', 'email', 'password', 'role', 'picture'],
    });

    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    return admin;
  }

  /**
   * Comprueba que el nombre de usuario no esté asignado a otra cuenta.
   *
   * @param username Nombre que se quiere reservar.
   * @param id Identificador opcional de la cuenta que se está actualizando.
   * @returns No devuelve valor si el nombre está disponible.
   * @throws HttpException si otra cuenta ya utiliza el nombre.
   */
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

  /**
   * Crea una cuenta nueva y almacena la contraseña como hash.
   *
   * @param data Datos requeridos para crear el administrador.
   * @returns La entidad del administrador guardada.
   * @throws HttpException si el nombre de usuario ya está ocupado.
   */
  async create(data: CreateAdminDto): Promise<void> {
    await this.verifyUnique(data.username);

    const admin = this.adminRepository.create({
      ...data,
      password: await hashPassword(data.password),
    });

    /**
     * La creación del admin puede incluir el hash de contraseña en la respuesta.
     * create asigna el hash a la entidad y devuelve el resultado de save.
     * select: false protege consultas posteriores, pero no necesariamente quita
     * esa propiedad de la entidad recién creada. Conviene responder con un DTO público
     * que nunca incluya la contraseña.
     */
    this.adminRepository.save(admin);

    throw new HttpException('Admin successfully created', HttpStatus.CREATED);
  }

  /**
   * Actualiza una cuenta y vuelve a hashear la contraseña si se envía.
   *
   * @param id Identificador numérico del administrador.
   * @param data Campos opcionales que se desean actualizar.
   * @returns No devuelve valor; actualmente comunica el éxito mediante una
   *          HttpException con estado HTTP 200.
   * @throws NotFoundException si la cuenta no existe.
   * @throws HttpException si el nombre de usuario ya está ocupado.
   */
  async update(id: number, data: UpdateAdminDto): Promise<void> {
    await this.findOneById(id);

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

  /**
   * Elimina físicamente una cuenta de administrador.
   *
   * @param id Identificador numérico del administrador.
   * @returns No devuelve valor; actualmente comunica el éxito mediante una
   *          HttpException con estado HTTP 200.
   * @throws NotFoundException si no se eliminó ninguna cuenta con ese ID.
   */
  async remove(id: number): Promise<void> {
    const result = await this.adminRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    throw new HttpException('Admin successfully removed', HttpStatus.OK);
  }

  /**
   * Lista todas las cuentas de administrador.
   *
   * @returns Todas las entidades de administradores.
   */
  async findAll(): Promise<AdminEntity[]> {
    return this.adminRepository.find();
  }
}
