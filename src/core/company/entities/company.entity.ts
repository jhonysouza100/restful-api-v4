import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminEntity } from '../../admins/entities/admin.entity';
import { CreateAccessKeysDto } from '../dtos/create-company.dto';
import { CreatePrivateKeysDto } from '../dtos/update-company.dto';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 510, nullable: true })
  picture: string;

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

  @ManyToOne(() => AdminEntity, (admin) => admin.companies, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
