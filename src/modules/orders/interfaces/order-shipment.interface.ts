import { DeliveryTypeEnum } from "../../shipments/enum/delivery-type.enum"

export class OrderShipmentInterface {
  deliveredType: DeliveryTypeEnum
  pickupLocation?: string
  fullName: string
  dni: string
  phone: string
  email?: string
  streetName?: string
  streetNumber?: string
  city?: string
  provinceName?: string
  provinceCode?: string
  postalCodeDestination: string
  dimensions: {
    declaredValue: number
    weight: number
    height: number
    width: number
    length: number
  }
  shipment_url?: string
  shipment_cost?: number
}