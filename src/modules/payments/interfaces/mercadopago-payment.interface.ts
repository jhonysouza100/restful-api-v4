export enum MercadoPagoPaymentStatusEnum {
  APPROVED = 'approved',
  IN_MEDIATION = 'in_mediation',
}

export enum MercadoPagoPaymentStatusDetailEnum {
  ACCREDITED = 'accredited',
  PENDING = 'pending',
  CANCELLED = 'cancelled'
}

export interface MercadoPagoPayment {
  accounts_info: unknown | null;
  acquirer_reconciliation: unknown[];
  additional_info: AdditionalInfo;
  authorization_code: string | null;
  binary_mode: boolean;
  brand_id: string | null;
  build_version: string;
  call_for_authorize_id: string | null;
  captured: boolean;
  card: Record<string, unknown>;
  charges_details: ChargeDetail[];
  charges_execution_info: ChargesExecutionInfo;
  collector_id: number;
  corporation_id: number | null;
  counter_currency: string | null;
  coupon_amount: number;
  currency_id: string;
  date_approved: string;
  date_created: string;
  date_last_updated: string;
  date_of_expiration: string | null;
  deduction_schema: string | null;
  description: string;
  differential_pricing_id: number | null;
  external_reference: string;
  fee_details: FeeDetail[];
  financing_group: string | null;
  id: number;
  idempotency_key: string;
  installments: number;
  integrator_id: string | null;
  issuer_id: string;
  live_mode: boolean;
  marketplace_owner: string | null;
  merchant_account_id: string | null;
  merchant_number: string | null;
  metadata: Record<string, unknown>;
  money_release_date: string;
  money_release_schema: string | null;
  money_release_status: string;
  notification_url: string | null;
  operation_type: string;
  order: Order;
  payer: Payer;
  payment_method: PaymentMethod;
  payment_method_id: string;
  payment_type_id: string;
  platform_id: string | null;
  point_of_interaction: PointOfInteraction;
  pos_id: string | null;
  processing_mode: string;
  refunds: Refund[];
  release_info: unknown | null;
  shipping_amount: number;
  sponsor_id: number | null;
  statement_descriptor: string | null;
  status: MercadoPagoPaymentStatusEnum;
  status_detail: MercadoPagoPaymentStatusDetailEnum;
  store_id: string | null;
  tags: string[] | null;
  taxes_amount: number;
  tenant_context: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  transaction_details: TransactionDetails;
}

interface AdditionalInfo {
  ip_address: string;
  items: AdditionalItem[];
  tracking_id: string;
}

interface AdditionalItem {
  category_id: string;
  description: string;
  id: string;
  picture_url: string;
  quantity: string;
  title: string;
  unit_price?: string;
}

interface ChargeDetail {
  accounts: ChargeAccounts;
  amounts: ChargeAmounts;
  base_amount: number;
  client_id: number;
  date_created: string;
  external_charge_id: string;
  id: string;
  last_updated: string;
  metadata: ChargeMetadata;
  name: string;
  rate: number;
  refund_charges: unknown[];
  reserve_id: string | null;
  type: string;
  update_charges: unknown[];
}

interface ChargeAccounts {
  from: string;
  to: string;
}

interface ChargeAmounts {
  original: number;
  refunded: number;
}

interface ChargeMetadata {
  reason: string;
  source: string;
  source_detail: string;
}

interface ChargesExecutionInfo {
  internal_execution: InternalExecution;
}

interface InternalExecution {
  date: string;
  execution_id: string;
}

interface FeeDetail {
  amount: number;
  fee_payer: string;
  type: string;
}

interface Order {
  id: string;
  type: string;
}

interface Payer {
  email: string;
  entity_type: string | null;
  first_name: string | null;
  id: string;
  identification: Identification;
  last_name: string | null;
  operator_id: string | null;
  phone: Phone;
  type: string | null;
}

interface Identification {
  number: string;
  type: string;
}

interface Phone {
  number: string | null;
  extension: string | null;
  area_code: string | null;
}

interface PaymentMethod {
  id: string;
  issuer_id: string;
  type: string;
}

interface PointOfInteraction {
  application_data: ApplicationData;
  business_info: BusinessInfo;
  location: Location;
  references: Reference[];
  transaction_data: TransactionData;
  type: string;
}

interface ApplicationData {
  name: string;
  operating_system: string | null;
  version: string;
}

interface BusinessInfo {
  branch: string;
  sub_unit: string;
  unit: string;
}

interface Location {
  source: string;
  state_id: string;
}

interface Reference {
  id: string;
  type: string;
}

interface TransactionData {
  e2e_id: string | null;
}

interface Refund {
  id?: number;
  amount?: number;
  status?: string;
  [key: string]: unknown;
}

interface TransactionDetails {
  acquirer_reference: string | null;
  external_resource_url: string | null;
  financial_institution: string | null;
  installment_amount: number;
  net_received_amount: number;
  overpaid_amount: number;
  payable_deferral_period: string | null;
  payment_method_reference_id: string | null;
  total_paid_amount: number;
}