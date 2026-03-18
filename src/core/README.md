# Sistema de Tenencia (Multi-Tenant)

## Descripción General
Sistema de autenticación multi-tenant que permite identificar y gestionar diferentes inquilinos (tenants) en la aplicación. Cada tenant tiene sus propias credenciales, configuraciones y datos aislados.

## Conceptos Clave

### ¿Qué es un Tenant?
Un tenant es una entidad aislada dentro del sistema que representa un usuario/empresa. Cada tenant tiene:
- Credenciales de email (Gmail) para enviar correos
- API Key para autenticación programática
- Dominio personalizado
- Configuraciones específicas (Mercadopago, Google Sheets, etc.)

### Autenticación Multi-Tenant
**El sistema valida que CADA REQUEST pertenezca a un tenant válido**. Soporta dos métodos:
1. **API Key**: Header `x-api-key` en la solicitud
2. **Dominio**: La URL de origen del request

### Identificación del Tenant

El sistema identifica el tenant de **dos formas** (en orden de prioridad):

#### 1. API Key (Header `x-api-key`)
Envía la API Key del tenant en el header:

```bash
curl -H "x-api-key: abc123xyz" http://localhost:3000/api/v1/products/perfumes
```

**Nota:** La API Key debe estar registrada en la base de datos en el campo `apiKey` de la entidad `Tenant`.

#### 2. Dominio de la URL
El sistema identifica automáticamente el tenant por el dominio desde donde se hace la consulta. Por ejemplo, si `mitienda.com` hace una consulta, el sistema buscará el tenant asociado a ese dominio:

```bash
# El tenant se identifica automáticamente por el dominio desde donde se hace la consulta con el header Origin
curl -H "Origin: https://mitienda.com" http://localhost:3000/api/v1/products
```

**Nota:** El dominio debe estar registrado en la base de datos en el campo `domain` de la entidad `Tenant`.

### Aislamiento de Datos

- ✅ Cada operación CRUD filtra automáticamente por `tenantId`
- ✅ Los productos solo son visibles para su tenant correspondiente
- ✅ No se puede acceder a productos de otros tenants
- ✅ El `tenantId` se asigna automáticamente al crear productos
- ✅ Todas las queries incluyen el filtro de tenant automáticamente

### Uso

#### Ejemplo: Crear un producto

```http
# Usando API Key
POST /api/v1/products
x-api-key: abc123xyz
Content-Type: application/json

{
  "name": "Chanel No. 5",
  "price": 89.99,
  "stock": 50,
  "brand": "Chanel",
  "size": "100ml"
}
```

```http
# O usando el dominio (el tenant se identifica automáticamente) Desde: https://mitienda.com
POST /api/v1/products
Content-Type: application/json
Origin: https://mitienda.com

{
  "name": "Chanel No. 5",
  "price": 89.99,
  "stock": 50,
  "brand": "Chanel",
  "size": "100ml"
}
```

#### Ejemplo: Listar productos

```http
# Usando API Key
GET /api/v1/products
x-api-key: abc123xyz
```

```http
# O usando dominio (el tenant se identifica automáticamente)
GET api/v1/products
Origin: https://mitienda.com
```

**Respuesta:** Solo retorna los productos del tenant correspondiente (identificado por API Key o dominio).

#### Ejemplo: Obtener un producto específico

```http
# Usando API Key
GET /api/v1/products/1
x-api-key: abc123xyz
```

```http
# O usando dominio
GET /api/v1/products/1
Origin: https://mitienda.com
```

**Nota:** Si el producto con ID 1 no pertenece al tenant identificado, retornará 404.

### Entidad Tenant

Cada tenant tiene la siguiente estructura:

```typescript
{
  id: number;              // ID único del tenant
  name: string;            // Nombre del tenant
  domain: string;          // Dominio completo (ej: "mitienda.com") (opcional)
  apiKey: string;         // API Key única (opcional)
  isActive: boolean;       // Estado activo/inactivo
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de actualización
}
```

**Nota:** El tenant debe tener al menos uno de los siguientes campos configurado: `domain` o `apiKey`.

### Seguridad

- ✅ Validación automática del tenant en cada request
- ✅ Aislamiento completo de datos entre tenants
- ✅ No se puede acceder a datos de otros tenants
- ✅ Validación de existencia del tenant antes de procesar requests

Algunos de los endpoints requieren identificar el tenant mediante:
- Header `x-api-key` con la API Key del tenant, o
- Dominio completo en la URL desde donde se hace la consulta

## Componentes

### Guard (`tenant.guard.ts`)
**Protege todos los endpoints que usan `@UseGuards(TenantGuard)`**

Flujo:
1. Extrae tenant del request por API Key o dominio
2. Si no encuentra tenant → Lanza `UnauthorizedException`
3. Si encuentra tenant → Guarda en `TenantContextService` para acceso posterior
4. Permite continuar con el request

**Métodos de extracción** (en orden de prioridad):
- Header `x-api-key` → Busca por apiKey
- Header/Origin `origin` → Busca por dominio

### Service: TenantContextService (`tenant-context.service.ts`)
**Scope REQUEST** - Se crea una instancia por cada request

Gestiona el contexto del tenant actual en ese request:
```typescript
setTenantCredentials(data)        // Establece datos del tenant
getTenantId()                     // Obtiene ID
getTenantEmail()                  // Obtiene credenciales email
getTenantDomain()                 // Obtiene dominio
getTenantCompany()                // Obtiene empresa
getTenantSpreadsheets()           // Obtiene ID Google Sheets
getTanantMercadopago()            // Obtiene token Mercadopago
```

**Uso**: Otros servicios inyectan este servicio para acceder a datos del tenant actual.

## Flujo de Autenticación Multi-Tenant

```
1. Cliente envía request con x-api-key o desde origen específico
2. TenantGuard intercepta
3. Guard extrae tenant mediante API Key o dominio
4. Si no existe → 401 Unauthorized
5. Guard guarda tenant en TenantContextService
6. Otros servicios acceden al tenant actual via TenantContextService
7. Request se procesa en contexto del tenant específico
```

## Ejemplo de Uso

### Usar API Key para Autenticarse
```bash
POST /etc
Headers: x-api-key: abc123xyz...
{
  "etc": "etc"
}
```

### Acceder Datos del Tenant Actual (desde un Servicio)
```typescript
constructor(private tenantCtx: TenantContextService) {}

async sendEmail() {
  const tenantId = this.tenantCtx.getTenantId();
  const email = this.tenantCtx.getTenantEmail();
  // Usa estos datos...
}
```

## Puntos Importantes para Mantenimiento

### Seguridad
- **Scope REQUEST**: `TenantContextService` se crea por request → No hay mezcla de datos entre tenants
- **Select selectivo**: Queries solo retornan campos necesarios (ej: no retorna password en FindByApiKey)
- **Hashing**: Contraseñas hasheadas con bcrypt, nunca almacenadas en texto plano

### Integración
- **Módulo Global**: El CoreModule es `@Global()` → Disponible en toda la app
- **Exporta**: Guard, Interceptor y Services se exportan para uso en otros módulos
- **Multi-tenant automático**: Servicios que usan `TenantContextService` obtienen datos del tenant actual automáticamente

### Métodos No Usados
- `findAll()` - Traería todos los tenants (comentado/no usado)
- `TenantInterceptor` - Duplicado, el Guard ya maneja el contexto
