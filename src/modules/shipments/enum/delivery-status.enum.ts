export enum ShipmentStatusEnum {
  PENDING = 'pending', // Pago aprobado, esperando procesamiento
  PREPARING = 'preparing', // En empaque / preparación en depósito
  READY_FOR_PICKUP = 'ready_pickup', // Listo para que lo retire el correo (o el cliente)
  SHIPPED = 'shipped', // En camino / en manos de la empresa de transporte
  IN_TRANSIT = 'in_transit', // Llegó a un centro de distribución intermedio
  OUT_FOR_DELIVERY = 'out_delivery', // En distribución / sale a reparto hoy hacia el domicilio
  DELIVERED = 'delivered', // Entregado con éxito al destinatario
  FAILED_ATTEMPT = 'failed_attempt', // Intento de entrega fallido (no había nadie, dirección incorrecta)
  RETURNED = 'returned', // Devuelto al remitente / depósito central
  CANCELLED = 'cancelled', // Envío cancelado
}
