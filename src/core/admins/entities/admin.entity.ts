import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/roles.enum';
import { CompanyEntity } from '../../company/entities/company.entity';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  picture!: string;

  @Column({ type: 'enum', enum: Role, default: Role.ADMIN })
  role!: Role;

  @OneToMany(() => CompanyEntity, (company) => company.admin)
  companies!: CompanyEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
