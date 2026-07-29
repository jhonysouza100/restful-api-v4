import { OrderItemInterface } from "../interfaces/order-item.interface";
import { OrderPaymentInterface } from "../interfaces/order-payment.interface";
import { OrderShipmentInterface } from "../interfaces/order-shipment.interface";

export interface OrderInterface {
  shipment?: OrderShipmentInterface
  items: OrderItemInterface[]
  payment?: OrderPaymentInterface,
  tenant_id: number
  user_id: number
  subtotal: number
  total: number
}