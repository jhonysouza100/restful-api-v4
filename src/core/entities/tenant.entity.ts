import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { EmailCredentialsDto } from '../dtos/tenant.dto';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string;

  @Column({ type: 'json', nullable: true })
  email: EmailCredentialsDto;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  domain: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  apiKey: string;

  @Column({ type: 'varchar', length: 510, nullable: true })
  picture: string;

  // @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  // role: Role;

  @Column({ type: 'varchar', nullable: true })
  role: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  verified: boolean;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  sub: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mercadopago: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  spreadsheets: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  company: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}