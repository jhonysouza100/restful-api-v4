import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderStatusEnum } from "../enum/order-status.enum";
import { OrderItemInterface } from "../interfaces/order-item.interface";
import { OrderPaymentInterface } from "../interfaces/order-payment.interface";
import { OrderShipmentInterface } from "../interfaces/order-shipment.interface";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'user_id', nullable: true })
  user_id?: number

  @Column({ name: 'tenant_id'})
  tenant_id: number

  @Column("json", { nullable: true })
  items?: OrderItemInterface[]

  @Column("json", { nullable: true })
  shipment?: OrderShipmentInterface

  @Column({
    type: "enum",
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnum
  
  @Column("decimal", { precision: 10, scale: 2})
  subtotal: number

  @Column("decimal", { precision: 10, scale: 2})
  total: number

  @Column("json", { nullable: true })
  payment?: OrderPaymentInterface

  @CreateDateColumn()
  createdAt: Date;
    
  @UpdateDateColumn()
  updatedAt: Date;

  // Método helper para calcular el total
  calculateTotal(): number {
    if (!this.items) return 0

    let subtotal = this.items.reduce((sum, detail) => {
      const itemTotal = detail.price * detail.quantity
      const discount = detail.discount || 0
      return sum + (itemTotal - discount)
    }, 0)

    /** Aplicar cupón si existe
    if (this.coupon) {
      subtotal -= this.coupon.discount
    }
    */

    return Math.max(0, subtotal) // Asegurar que no sea negativo
  }

  // Método helper para verificar si la orden está pagada
  isPaid(): boolean {
    return this.status === OrderStatusEnum.COMPLETED
  }

  // Método helper para verificar si la orden está cancelada
  isCancelled(): boolean {
    return this.status === OrderStatusEnum.CANCELLED
  }

  // Método helper para verificar si la orden está pendiente
  isPending(): boolean {
    return this.status === OrderStatusEnum.PENDING
  }
}