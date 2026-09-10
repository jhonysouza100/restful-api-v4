# restful-api-v4

API backend para ChillHop Studio, construido con NestJS y TypeScript. El repositorio contiene únicamente el backend: no hay frontend, aplicación móvil ni panel administrativo en este proyecto.

> **Estado:** desarrollo activo. Se completó una primera ejecución del roadmap sobre configuración, CORS, aislamiento tenant, validación de productos y manejo de respuestas de Mercado Pago; pagos idempotentes, transacciones completas, operación y documentación avanzada siguen pendientes.

## Overview

El servicio expone una API versionada bajo `/api/v1`, documentación Swagger en `/docs` y persistencia MySQL mediante TypeORM. El dominio actual cubre autenticación JWT con roles, tenants, productos, órdenes, pagos con Mercado Pago, envíos con MiCorreo, carga de imágenes en Cloudinary y correo SMTP.

La documentación de este archivo describe el estado observado en el código, no una promesa de funcionalidades futuras. Debe actualizarse junto con cada cambio de contrato o integración.

## Current Status

| Área | Estado | Observación |
|---|---|---|
| Arranque NestJS | Implementado en desarrollo | Variables documentadas en `.env.example`, CORS usa `ALLOWED_ORIGINS` y `synchronize` queda limitado a desarrollo. Falta estrategia de migraciones. |
| API versionada | Implementado | Versionado URI `v1`; Swagger se monta en `/docs`. |
| Persistencia | Parcial | TypeORM + MySQL; falta reemplazar sincronización de desarrollo por migraciones productivas. |
| Autenticación | Parcial avanzado | JWT usa `JWT_SECRET` validado desde entorno y la administración de tenants requiere `ROOT`; faltan pruebas manuales y endurecimiento de expiración/errores. |
| Multi-tenancy | Parcial avanzado | Lecturas de productos, rutas públicas y administración de tenants quedaron más restringidas; órdenes y todos los flujos requieren revisión final. |
| Productos | Parcial avanzado | DTOs básicos, filtros tenant-safe y lecturas por tenant mejorados; stock transaccional completo, archivos y errores siguen pendientes. |
| Órdenes | Parcial | Creación y webhook existentes; todavía falta idempotencia y atomicidad completa de orden, pago e inventario. |
| Pagos | Parcial avanzado | DTO ya no expone la clave privada al cliente y se validan respuestas HTTP externas; falta idempotencia, verificación de webhook y estados monotónicos. |
| Envíos | Parcial | MiCorreo integrado en rates/import/agencies; respuestas, credenciales y errores aún requieren normalización. |
| Emails | Parcial | SMTP/Nodemailer presente y se eliminó un log sensible; faltan límites de adjuntos y errores uniformes. |
| Operación | Pendiente | No se observan Dockerfile, compose, CI/deploy reproducible ni health check. |
| Documentación | Parcial avanzado | README actualizado con ejecución real, estado y estimaciones; Swagger e READMEs internos aún requieren alineación completa. |
| Frontend/UI | Pendiente | Fuera del alcance de este repositorio. |

## Arquitectura

```text
src/
├── main.ts                 # bootstrap, CORS, versionado, Swagger y pipes globales
├── app.module.ts           # composición de módulos
├── common/                 # configuración, constantes y utilidades compartidas
├── core/
│   ├── auth/               # login, JWT, roles y guards
│   └── tenant/             # tenant context, guard, entidad y administración
└── modules/
    ├── products/           # catálogo e imágenes
    ├── orders/             # órdenes y stock
    ├── payments/           # Mercado Pago
    ├── shipments/          # MiCorreo
    ├── emails/             # SMTP/Nodemailer
    └── uploads/            # Cloudinary y archivos
```

### Stack detectado

- NestJS 11, TypeScript 5, Node.js.
- Express mediante `@nestjs/platform-express`.
- TypeORM 0.3 + MySQL (`mysql2`).
- Zod para configuración y `ValidationPipe` con `class-validator`/`class-transformer`.
- JWT, bcrypt, throttling y Swagger.
- Cloudinary, Mercado Pago, MiCorreo y SMTP/Nodemailer.
- Jest/Supertest están configurados; este roadmap no estima la creación de tests automatizados.

## Configuración e integraciones

### Variables declaradas por el esquema de entorno

`PORT`, `ALLOWED_ORIGINS`, `MONGO_DB_URL`, `REDIS_URL`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `SERVER_URL`, `THROTTLER_LIMITER`, `ITEMS_PER_PAGE`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`, `SMTP_USER`, `SMTP_PASS` y `APP_NAME`.

Se creó `.env.example` sin secretos y se confirmó que MongoDB/Redis no forman parte del esquema activo actual. `BREVO_API_KEY`, `MERCADOPAGO_API_KEY` y `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` quedan como variables opcionales/no usadas por el runtime visible; no se deben copiar secretos reales al repositorio.

### Integraciones actuales

| Integración | Uso visible | Riesgo/próximo control |
|---|---|---|
| MySQL | Entidades de tenants, productos y órdenes | Migraciones, `synchronize`, índices y transacciones. |
| Cloudinary | Subida/duplicación/borrado de imágenes | Validar tamaño/tipo, ownership y limpieza de recursos. |
| Mercado Pago | Preference y notificación/webhook | Verificar payload, URL, credenciales, idempotencia y estados. |
| MiCorreo | Tarifas, importaciones y agencias | Validar respuestas y normalizar errores externos. |
| SMTP/Nodemailer | Envío de emails | Quitar logs sensibles y limitar adjuntos. |
| Redis/MongoDB | Variables declaradas, uso no confirmado | No asumir dependencia funcional hasta verificar imports y runtime. |

## API visible

Las rutas exactas deben mantenerse sincronizadas con Swagger. Este inventario resume los grupos observados y sus dependencias principales:

| Grupo | Responsabilidad | Auth/tenant observado |
|---|---|---|
| Auth | Login, emisión/verificación JWT y roles | JWT parcial; revisar protección de administración. |
| Tenants | Administración y resolución de tenants | Creación y actualización requieren JWT con rol `ROOT`; revisar flujos de bootstrap y errores. |
| Products | Crear, listar, actualizar, eliminar y operar imágenes | Lecturas principales requieren tenant; stock, archivos y manejo de excepciones aún necesitan cierre. |
| Orders | Crear/consultar órdenes y actualizar estados/stock | Requiere terminar filtro tenant, validación de precios/cantidades e idempotencia. |
| Payments | Crear preference y recibir notificaciones | Las respuestas HTTP externas se validan; webhook aún necesita verificación e idempotencia. |
| Shipments | Rates, importación y agencias de MiCorreo | Credenciales y respuestas externas deben validarse. |
| Emails | Envío SMTP y adjuntos | Requiere límites y manejo uniforme de excepciones. |
| Uploads | Operaciones con Cloudinary | Revisar claves privadas y autorización por recurso. |

Rutas operativas declaradas en runtime:

- Base API: `/api/v1`.
- Swagger: `/docs`.
- CORS: actualmente `origin: '*'` con `credentials: true`; esto es incompatible con un despliegue seguro y no usa `ALLOWED_ORIGINS`.

## Inventario de trabajo

### Core

- **P0:** contrato de arranque, configuración, JWT, CORS, guards y aislamiento tenant.
- **P1:** autorización por rol y administración segura de tenants.
- **P2:** contratos Swagger y documentación interna alineada.

### Features

- **P1:** productos, inventario, órdenes y checkout.
- **P1:** preference/webhook e idempotencia de Mercado Pago.
- **P2:** MiCorreo, emails y Cloudinary endurecidos.

### Infrastructure / operación

- **P2:** health check, logs básicos, Docker y deploy reproducible.
- **P3:** estrategia de migraciones, CI y observabilidad ampliada.

### UX/UI

No hay frontend en este repositorio. La UX de administración, checkout y seguimiento debe planificarse como proyecto separado o como aplicación consumidora de esta API.

### Optimización y futuro

Después del MVP: índices y queries, caching solo donde sea necesario, métricas, colas para emails/webhooks, panel admin, tracking de envíos, cupones, variantes, multi-moneda y reportes.

## Roadmap por fases

| Fase | Objetivo | Dependencias | Resultado | Estimación base |
|---|---|---|---|---:|
| 0. Arranque y contrato operativo | Hacer reproducible el entorno y fijar el contrato API | Ninguna | `.env.example`, rutas y variables verificadas | 10 h |
| 1. Seguridad y consistencia | Cerrar JWT, tenants, CORS y errores críticos | Fase 0 | Base segura para construir features | 24 h |
| 2. Productos e inventario | CRUD tenant-safe y stock coherente | Fase 1 | Catálogo usable por tenant | 18 h |
| 3. Checkout y órdenes | Orden calculada y persistida solo con datos confiables | Fases 1–2 | Flujo de compra consistente | 16 h |
| 4. Pagos/webhooks | Estados e inventario resistentes a reintentos | Fase 3 | Pago confirmado de forma segura | 14 h |
| 5. Integraciones operativas | Endurecer email, Cloudinary y MiCorreo | Fases 2–4 | Integraciones confiables | 12 h |
| 6. Operación y documentación | Ejecutar, observar y mantener el servicio | Fases 0–5 | Deploy reproducible y docs vivas | 14 h |
| **Total** |  |  |  | **108 h** |

## Tabla maestra de tareas

Las horas son para una sola persona y no incluyen tests automatizados. Cada tarea está limitada a 1–4 horas para evitar tickets XL.

| ID | Prioridad | Tarea | Dep. | Complejidad | h | Jornadas 4h / 2h | Estado |
|---|---|---|---|---:|---:|---:|---|
| F0-01 | P0 | Confirmar rutas `/api/v1`, `/docs` y respuestas | — | S | 2 | 0.5 / 1 | Hecho |
| F0-02 | P0 | Crear `.env.example` seguro | F0-01 | S | 2 | 0.5 / 1 | Hecho |
| F0-03 | P0 | Verificar variables usadas y variables muertas | F0-02 | S | 2 | 0.5 / 1 | Hecho |
| F0-04 | P0 | Validar arranque con entorno completo | F0-03 | S | 2 | 0.5 / 1 | Hecho: build OK |
| F0-05 | P0 | Definir datos mínimos y contrato de tenant | F0-01 | S | 2 | 0.5 / 1 | Parcial |
| F1-01 | P0 | Confirmar `JWT_SECRET` desde entorno y expiración | F0-04 | S | 3 | 0.75 / 1.5 | Parcial |
| F1-02 | P0 | Separar identificación pública y administración tenant | F0-05 | M | 4 | 1 / 2 | Parcial |
| F1-03 | P0 | Proteger rutas administrativas de tenants | F1-02 | M | 3 | 0.75 / 1.5 | Hecho: ROOT |
| F1-04 | P0 | Normalizar `TenantGuard` y `TenantContextService` | F1-02 | M | 4 | 1 / 2 | Parcial |
| F1-05 | P0 | Aplicar filtro tenant a productos y órdenes | F1-04 | M | 4 | 1 / 2 | Parcial: productos |
| F1-06 | P0 | Corregir CORS con `ALLOWED_ORIGINS` | F0-03 | S | 2 | 0.5 / 1 | Hecho |
| F1-07 | P0 | Normalizar HTTP status y excepciones | F0-01 | M | 4 | 1 / 2 | Pendiente |
| F2-01 | P1 | Completar validadores de DTO de productos | F1-05 | M | 4 | 1 / 2 | Parcial |
| F2-02 | P1 | Revisar multipart, tamaño y tipo de archivos | F2-01 | S | 2 | 0.5 / 1 | Pendiente |
| F2-03 | P1 | Corregir filtros y paginación tenant-safe | F2-01 | M | 4 | 1 / 2 | Hecho: filtros base |
| F2-04 | P1 | Revisar slugs, duplicación y borrado Cloudinary | F2-02 | M | 4 | 1 / 2 | Pendiente |
| F2-05 | P1 | Hacer stock seguro y coherente | F2-03 | M | 4 | 1 / 2 | Pendiente |
| F3-01 | P1 | Validar cantidades y precios desde servidor | F2-05 | M | 4 | 1 / 2 | Parcial |
| F3-02 | P1 | Completar estados y persistencia de órdenes | F3-01 | M | 4 | 1 / 2 | Pendiente |
| F3-03 | P1 | Integrar rates MiCorreo sin confiar en cliente | F3-02 | M | 4 | 1 / 2 | Pendiente |
| F3-04 | P1 | Crear preference con datos internos | F3-02 | M | 4 | 1 / 2 | Parcial |
| F4-01 | P1 | Alinear `notification_url` con ruta real | F3-04 | S | 2 | 0.5 / 1 | Hecho: ruta actual |
| F4-02 | P1 | Validar respuestas y credenciales Mercado Pago | F4-01 | M | 4 | 1 / 2 | Hecho: HTTP |
| F4-03 | P1 | Añadir idempotencia del webhook | F4-02 | L | 4 | 1 / 2 | Pendiente |
| F4-04 | P1 | Proteger transiciones de orden y stock | F4-03 | M | 4 | 1 / 2 | Pendiente |
| F5-01 | P2 | Eliminar logs sensibles y debugging | F1-07 | S | 2 | 0.5 / 1 | Parcial |
| F5-02 | P2 | Endurecer email y adjuntos | F5-01 | M | 3 | 0.75 / 1.5 | Pendiente |
| F5-03 | P2 | Normalizar errores MiCorreo | F3-03 | M | 3 | 0.75 / 1.5 | Pendiente |
| F5-04 | P2 | Limitar y autorizar operaciones Cloudinary | F2-04 | M | 4 | 1 / 2 | Pendiente |
| F6-01 | P2 | Agregar health check operativo | F0-04 | S | 2 | 0.5 / 1 | Pendiente |
| F6-02 | P2 | Crear Dockerfile reproducible | F6-01 | M | 4 | 1 / 2 | Pendiente |
| F6-03 | P2 | Documentar deploy y rollback | F6-02 | S | 2 | 0.5 / 1 | Pendiente |
| F6-04 | P2 | Actualizar Swagger y READMEs internos | F1-07 | M | 4 | 1 / 2 | Parcial: README |
| F6-05 | P3 | Limpieza de tipos, imports y módulos muertos | F6-04 | M | 2 | 0.5 / 1 | Pendiente |
| F6-06 | P3 | Revisar índices y queries principales | F1-05 | M | 4 | 1 / 2 | Pendiente |

## Estimación

- **Roadmap completo:** 108 horas base.
- **Buffer central:** 20% para integración, datos existentes y contratos externos.
- **Roadmap completo con buffer:** `108 × 1.20 = 130 horas`.
- **Jornadas mínimas:** `130 / 4 = 32.5`, aproximadamente **33 jornadas de 4 horas**.
- **Jornadas conservadoras:** `130 / 2 = 65 jornadas de 2 horas`.

### Alcance MVP

El MVP funcional contiene F0 completa, F1 completa, F2 completa, F3 completa y F4 completa: **82 horas base**, **99 horas con buffer**, aproximadamente **25 jornadas de 4 horas** o **50 jornadas de 2 horas**.

Incluye:

1. Arranque reproducible y entorno documentado.
2. Tenant seguro y filtros consistentes.
3. Login JWT/roles protegido.
4. Productos CRUD aislados por tenant.
5. Creación de órdenes con cantidades, precios y totales calculados en servidor.
6. Preference de Mercado Pago.
7. Webhook idempotente que actualiza orden e inventario de forma segura.
8. Validación manual de los flujos principales.

Puede esperar fuera del MVP: emails refinados, MiCorreo avanzado, Cloudinary refinado, Docker/deploy, health check, optimización de queries, observabilidad ampliada, panel admin y frontend.

> La estimación no incluye tests automatizados, diseño de frontend, migración de datos histórica ni cambios de producto no descritos en esta tabla.

## ¿Qué hago ahora?

### Next Step recomendado

**Auditar y corregir la configuración de arranque y seguridad — 2–3 horas.**

1. Revisar `src/common/config/env.config.ts` y clasificar variables obligatorias.
2. Confirmar que `src/common/constants.ts` usa el `JWT_SECRET` real del entorno.
3. Conectar `ALLOWED_ORIGINS` en `src/main.ts` y eliminar `origin: '*'` con credenciales.
4. Documentar `.env.example` sin secretos.
5. Confirmar las rutas `/api/v1` y `/docs` contra Swagger.
6. Arrancar el proyecto con una configuración reproducible y registrar cualquier variable incompatible.

**Resultado esperado:** el proyecto arranca sin contradicciones entre documentación y runtime. Después de esta tarea, proteger la administración de tenants es el siguiente bloque P0.

### Cómo dividir una tarea bloqueada

Si una tarea no puede cerrarse en 2–4 horas, dividirla por contrato: primero reproducir el fallo, luego aislar la integración, después corregir el caso feliz y finalmente cubrir errores/reintentos. Registrar la dependencia externa, el resultado observable y la decisión tomada; no aumentar una tarea a XL.

## Recomendaciones técnicas

| Problema | Impacto | Recomendación | Beneficio | Momento |
|---|---|---|---|---|
| `synchronize: true` | Puede alterar datos en producción | Migraciones versionadas y revisión antes de aplicar | Cambios reversibles | Ahora/MVP |
| CORS `*` + credentials | Riesgo de acceso cross-origin | Parsear `ALLOWED_ORIGINS` y permitir solo orígenes conocidos | Reduce exposición | Ahora |
| Aislamiento tenant irregular | Fuga de datos entre clientes | Guard central + filtro explícito en cada query | Seguridad de negocio | MVP |
| JWT/roles parcial | Administración expuesta | Expiración, guard y permisos explícitos | Control de acceso | MVP |
| Webhook sin idempotencia fuerte | Stock/orden duplicados | Clave única de evento y transición monotónica | Consistencia | MVP |
| Errores convertidos en strings | Clientes no pueden reaccionar bien | Excepciones Nest y DTO de error estable | Integración predecible | Ahora |
| DTOs incompletos | Datos inválidos o inseguros | Validadores, límites y whitelist | Menor superficie de ataque | MVP |
| Logs sensibles/debug | Exposición de secretos y ruido | Logging estructurado sin credenciales | Operación segura | Después de MVP |
| Sin health check/deploy | Difícil operar y recuperar | Endpoint de salud, Docker y rollback | Reproducibilidad | Después de MVP |

## Known Issues y riesgos

- El esquema de entorno exige dependencias cuyo uso real no está confirmado.
- `ALLOWED_ORIGINS` existe, pero el bootstrap usa `origin: '*'`.
- `synchronize: true` no es una estrategia segura para producción.
- Hay endpoints de productos, payments y tenants que requieren auditoría de guards y filtros.
- Mercado Pago puede reintentar o entregar eventos fuera de orden; el stock no debe mutar dos veces.
- Credenciales, claves privadas y payloads pueden filtrarse si se mantienen logs de debugging.
- Las respuestas de MiCorreo y Mercado Pago no están suficientemente validadas.
- No hay infraestructura declarativa ni pipeline de despliegue visible.
- El único e2e visible es el starter de Nest; la validación manual del MVP debe ser explícita.
- Los READMEs internos pueden no reflejar rutas y campos actuales.

## Progress tracking

Actualizar esta sección cuando se cierre una tarea:

- [x] Fase 0 — configuración, `.env.example` y build reproducible en desarrollo.
- [~] Fase 1 — CORS, protección ROOT y filtros de productos aplicados; faltan errores y aislamiento integral.
- [~] Fase 2 — validación básica y filtros tenant-safe aplicados; faltan stock, multipart y Cloudinary.
- [~] Fase 3 — cálculo server-side existente y preference interna; faltan transacciones y estados completos.
- [~] Fase 4 — URL y validación HTTP de Mercado Pago corregidas; falta idempotencia/verificación.
- [~] Fase 5 — log sensible eliminado; faltan límites y normalización de integraciones.
- [ ] Fase 6 — operación, health check, Docker y deploy reproducible.

## Resumen ejecutivo

El repositorio mantiene una base funcional para una API de catálogo y comercio y está en **modo desarrollo activo**. La primera ejecución del roadmap dejó el build en verde, creó `.env.example`, corrigió CORS, limitó `synchronize` al desarrollo, protegió la administración de tenants con `ROOT`, aplicó filtros tenant-safe a lecturas de productos, añadió validación básica de DTOs y validó respuestas HTTP de Mercado Pago. No es production-ready: siguen pendientes idempotencia de webhooks, transacciones completas de stock/orden, normalización de errores, migraciones y operación reproducible.

La estimación original se conserva como referencia de alcance: MVP **82 horas base / 99 con buffer** y roadmap completo **108 horas base / 130 con buffer**, sin tests automatizados ni frontend. Las próximas cinco tareas son: **F1-07** normalizar excepciones, **F1-05** completar aislamiento en órdenes, **F2-05** hacer stock transaccional, **F4-03** implementar idempotencia y **F6-01** agregar health check.

## Licencia

El paquete declara licencia `UNLICENSED`. Confirmar la política de distribución antes de publicar o reutilizar este servicio.

## Referencias del repositorio

- `src/main.ts` — bootstrap, CORS, versionado y Swagger.
- `src/app.module.ts` — composición principal.
- `src/common/config/env.config.ts` — esquema de variables.
- `src/core/auth/` — JWT, roles y autenticación.
- `src/core/tenant/` — contexto y aislamiento tenant.
- `src/modules/` — productos, órdenes, pagos, envíos, emails y uploads.
- `changes.txt` — historial/pendientes del proyecto.
- `test/app.e2e-spec.ts` — prueba inicial de Nest.
