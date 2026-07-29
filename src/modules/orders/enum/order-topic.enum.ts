export enum OrderTopicEnum {
  NUEVA_VENTA = 'Nueva venta',
  VENTA_CONFIRMADA = 'Venta confirmada',
  VENTA_ACTUALIZADA = 'Venta actualizada',
  VENTA_CANCELADA = 'Venta cancelada',

  PAGO_PENDIENTE = 'Pago pendiente',
  PAGO_APROBADO = 'Pago aprobado',
  PAGO_RECHAZADO = 'Pago rechazado',
  PAGO_REEMBOLSADO = 'Pago reembolsado',

  PREPARANDO_PEDIDO = 'Preparando pedido',
  PEDIDO_DESPACHADO = 'Pedido despachado',
  PEDIDO_EN_CAMINO = 'Pedido en camino',
  PEDIDO_ENTREGADO = 'Pedido entregado',

  STOCK_REPUESTO = 'Stock repuesto',
  STOCK_INSUFICIENTE = 'Stock insuficiente',
}