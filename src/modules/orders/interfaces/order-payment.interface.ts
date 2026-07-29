import { PaymentMethodsEnum } from "../../payments/enum/payment-methods.enum";

export class OrderPaymentInterface  {
  method?: PaymentMethodsEnum
  preference_id?: string
  payment_url?: string
  payment_id?: string
  status?: string
  status_detail?: string
}