import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Product } from '../../../modules/products/entities/product.entity';
import { AdminEntity } from '../../admins/entities/admin.entity';
import {
  CreateAccessKeysDto,
  CreatePrivateKeysDto,
} from '../dtos/update-company.dto';

@Entity('companies')
export class CompanyEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain!: string;

  @Column({ type: 'varchar', length: 510, nullable: true })
  picture!: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  verified!: boolean;

  @Column({ type: 'json', nullable: true })
  access_keys!: CreateAccessKeysDto;

  @Column({ type: 'json', nullable: true, select: false })
  private_keys!: CreatePrivateKeysDto;

  @ManyToOne(() => AdminEntity, (admin) => admin.companies, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admin_id' })
  admin!: AdminEntity | null;

  @OneToMany(() => Product, (product) => product.company)
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
