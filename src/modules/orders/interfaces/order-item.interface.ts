export interface OrderItemInterface {
  item_id: number
  name: string
  quantity: number
  price: number
  discount?: number | 0
  subtotal: number
  image_url?: string
}