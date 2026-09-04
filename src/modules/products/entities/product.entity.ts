import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { QnA } from './QnA.entity';
// import { Review } from './review.entity';
import { ProductCategoryEnum } from '../enums/products.enum';

@Entity('products')
@Index(["tenant_id", "id"]) // Indice compuesto para acelerar las busquedas por tenant
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  tenant_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alias: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProductCategoryEnum, nullable: true, default: ProductCategoryEnum.OTHER })
  category: ProductCategoryEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  model: string;

  @Column({ type: 'json', nullable: true })
  specifications: { label: string, value: string }[];

  @Column('simple-json', { nullable: true })
  dimensions: {
    height: number,
    length: number,
    weight: number,
    width: number
  }

  @Column('simple-json', { nullable: true })
  images: { public_id: string; secure_url: string }[];

  @Column({ type: 'simple-json', nullable: true })
  color: {
    name: string,
    value: string,
  };

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  stock: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  maxCount: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  minCount: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  discount: number;

  @Column({ type: 'int', nullable: true, default: 5 })
  rating: number;

  @Column({ type: 'boolean', nullable: true, default: true })
  isActive: boolean;

  // @OneToMany(() => QnA, qna => qna.product, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // questions: QnA[];

  // @OneToMany(() => Review, review => review.product, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}