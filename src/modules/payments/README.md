
# Módulo de Payments (Mercado Pago)

## Descripción rápida
Servicio responsable de crear preferencias de pago en Mercado Pago y procesar notificaciones (webhooks) de pago. Incluye dos responsabilidades principales:

- Crear una preferencia en Mercado Pago a partir de items procesados por el sistema.
- Recibir notificaciones de Mercado Pago y (opcionalmente) obtener el detalle del pago.

## Endpoints (uso típico)
- POST /api/v1/payments/mercadopago/preference  -> crea la preferencia (invoca `createMercadopagoPreference`) **(USO INTERNO — NO EXPOSED)**
- POST /api/v1/payments/mercadopago/confirm    -> webhook público que recibe Mercado Pago (invoca `confirmMercadopagoPayment`)

Nota: las rutas exactas dependen del controller; arriba están alineadas con el valor usado en `notification_url` dentro del servicio.
IMPORTANTE: `createMercadopagoPreference` es un método de servicio pensado para uso interno por otros módulos (por ejemplo `orders.module`). No debe exponerse directamente como endpoint público; en su lugar, los controladores de módulos que representen procesos de negocio (ordenes, checkout) deben llamar al servicio internamente.

## Flujo — createMercadopagoPreference

1. El controlador recibe un payload que cumple `CreateMercadopagoPreferenceDto` (ver `dto/create-mercadopago-preference.dto.ts`). Principales campos:
	- items: array de objetos con id, title, quantity, price_with_discounts, category, description?
	- tenant: { private_key, domain, company }
	- order_id: id interno de la orden
	- back_urls?: { success, failure, pending }

2. `createMercadopagoPreference` monta un payload conforme a `CreateMercadopagoPreferenceInterface` mapeando cada item a { title, quantity, unit_price, category_id, description }.

3. Añade valores por defecto adicionales:
	- auto_return: "approved"
	- back_urls: si no se pasan en el request se construyen usando `tenant.domain`
	- external_reference: `order_id.toString()` (para relacionar la preferencia con la orden local)
	- notification_url: `${env.SERVER_URL}/api/v1/payments/mercadopago/confirm`
	- statement_descriptor: nombre de la compañía (tenant.company)

4. Hace un POST a `https://api.mercadopago.com/checkout/preferences` con Authorization: Bearer {tenant.private_key}.

5. Devuelve la respuesta de Mercado Pago (tipada como `MercadopagoResponseInterface`) al cliente que llamó al endpoint.

Puntos importantes:
- El `private_key` es sensible: en la implementación actual se espera en `tenant.private_key`. En producción es preferible obtener la key desde el contexto del tenant en servidor (no enviar desde cliente) y guardarla de forma segura.
- El campo `price_with_discounts` debe venir ya calculado por el módulo que crea la orden.

Nota adicional: si se necesita que un endpoint público inicie la creación de la preferencia (por ejemplo un checkout público), ese endpoint debe pertenecer al módulo de negocio (orders/checkout) y validar al tenant antes de llamar internamente a `PaymentsService.createMercadopagoPreference`. Evitar exponer la función del servicio de forma directa en rutas públicas del módulo `payments`.

## Flujo — confirmMercadopagoPayment (webhook)

1. Mercado Pago envía notificaciones al `notification_url` configurado en la preferencia. El payload del webhook tiene forma similar a `MercadopagoWebhookPayload` (ver `interfaces/mercadopago-webhook.interface.ts`) y suele contener `data: { id: '<payment_id>' }`.

2. `confirmMercadopagoPayment` recibe la notificación y puede:
	- Validar/registrar la recepción del webhook (log, auditoría).
	- Extraer `data.id` y realizar un GET a `https://api.mercadolibre.com/v1/payments/{id}` con el token del merchant (Bearer) para obtener el detalle completo del pago.
	- Tipar la respuesta del GET con `MercadopagoPaymentInterface`.

3. Con la información del pago (estado, status_detail, transaction_amount, external_reference, payer, etc.) se puede:
	- Actualizar el estado de la orden en la DB (ej: marcar como paid/failed).
	- Ejecutar lógica de negocio adicional (envío, notificaciones, contabilidad).

4. Responder al webhook con HTTP 200 o 201 para indicar a Mercado Pago que la notificación fue recibida correctamente.

Puntos importantes:
- La notificación inicial no contiene todo el detalle del pago: habitualmente sólo trae `data.id`. Se recomienda hacer un GET para obtener la información completa.
- Manejar reintentos: Mercado Pago reintenta el webhook si no recibe 2xx.

## Estructuras y tipos clave
- `CreateMercadopagoPreferenceDto` (dto) — input usado por `createMercadopagoPreference`.
- `CreateMercadopagoPreferenceInterface` (interfaces) — payload exacto enviado a la API de Mercado Pago.
- `MercadopagoResponseInterface` — forma de la respuesta al crear la preferencia.
- `MercadopagoWebhookPayload` / `MercadopagoPaymentInterface` — payload del webhook y detalle del pago cuando se obtiene por GET.

## Configuración requerida
- `env.SERVER_URL` debe apuntar a la URL pública donde Mercado Pago puede enviar webhooks.
- Cada tenant debe disponer de su `private_key` (Mercado Pago) para crear preferencias y consultar pagos.

## Ejemplos rápidos

Ejemplo mínimo para crear preferencia (JSON):

```json
{
  "items": [
	 { "id": 1, "title": "Producto A", "quantity": 1, "price_with_discounts": 100, "category": "clothing" }
  ],
  "tenant": { "private_key": "TEST-xxx", "domain": "https://miempresa.com", "company": "Mi Empresa" },
  "order_id": 666
}
```

Webhook recibido (ejemplo):

```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": { "id": "152598828503" },
  "date_created": "2026-04-05T08:22:08Z"
}
```

## Mantenimiento y notas
- Validar la firma/seguridad del webhook si se desea aumentar seguridad (comprobar IPs o implementar verificación adicional).
- No loguear keys privadas en producción.
- Asegurarse que `notification_url` sea accesible desde internet y use HTTPS.
- Considerar encolar el procesamiento del webhook (ej: colocar la tarea en una cola) si la post-procesación es costosa.

