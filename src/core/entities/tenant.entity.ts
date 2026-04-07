import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { CreateAccessKeysDto } from '../dtos/create-tenant.dto';
import { CreatePrivateKeysDto } from '../dtos/update-tenant.dto';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;
  
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 510, nullable: true })
  picture: string;

  // @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  // role: Role;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  verified: boolean;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'json', nullable: true })
  access_keys: CreateAccessKeysDto;

  @Column({ type: 'json', nullable: true, select: false })
  private_keys: CreatePrivateKeysDto;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}