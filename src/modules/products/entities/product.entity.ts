import { Entity, PrimaryGeneratedColumn, Column, BeforeUpdate, OneToMany, UpdateDateColumn, CreateDateColumn, Index } from 'typeorm';
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
  
  @Column({ type: 'varchar', length: 255 })
  slug: string;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  alias: string | null;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ProductCategoryEnum })
  category: ProductCategoryEnum;

  @Column({ type: 'varchar', length: 255 })
  brand: string;

  @Column({ type: 'varchar', length: 255 })
  model: string;

  @Column({ type: 'json', nullable: true })
  specifications: { label: string, value: string }[] | null;
  
  @Column('simple-json', { nullable: true })
  dimensions: {
    height: number,
    width: number,
    weight: number
  } | null;
  
  @Column('simple-json', { nullable: true })
  images: { public_id: string; secure_url: string }[] | null;

  @Column({ type: 'simple-json', nullable: true })
  color: {
    name: string,
    value: string,
  } | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', nullable: true, default: 1 })
  stock: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  discount: number | null;

  @Column({ type: 'int', nullable: true, default: 5 })
  rating: number | null;

  @Column({ type: 'boolean', nullable: true, default: true })
  isActive: boolean | null;

  // @OneToMany(() => QnA, qna => qna.product, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // questions: QnA[];

  // @OneToMany(() => Review, review => review.product, { cascade: true, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  // reviews: Review[];

  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}