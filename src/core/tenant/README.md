# Sistema de Tenencia (Multi-Company)

## Descripción General
Sistema de autenticación multi-company que permite identificar y gestionar diferentes inquilinos (companies) en la aplicación. Cada company tiene sus propias credenciales, configuraciones y datos aislados.

## Conceptos Clave

### ¿Qué es un Company?
Un company es una entidad aislada dentro del sistema que representa un usuario/empresa. Cada company tiene:
- Credenciales de email (Gmail) para enviar correos
- API Key para autenticación programática
- Dominio personalizado
- Configuraciones específicas (Mercadopago, Google Sheets, etc.)

### Autenticación Multi-Company
**El sistema valida que CADA REQUEST pertenezca a un company válido**. Soporta dos métodos:
1. **API Key**: Header `x-api-key` en la solicitud
2. **Dominio**: La URL de origen del request

### Identificación del Company

El sistema identifica el company de **dos formas** (en orden de prioridad):

#### 1. API Key (Header `x-api-key`)
Envía la API Key del company en el header:

```bash
curl -H "x-api-key: abc123xyz" http://localhost:3000/api/v1/products/perfumes
```

**Nota:** La API Key debe estar registrada en la base de datos en el campo `apiKey` de la entidad `Company`.

#### 2. Dominio de la URL
El sistema identifica automáticamente el company por el dominio desde donde se hace la consulta. Por ejemplo, si `mitienda.com` hace una consulta, el sistema buscará el company asociado a ese dominio:

```bash
# El company se identifica automáticamente por el dominio desde donde se hace la consulta con el header Origin
curl -H "Origin: https://mitienda.com" http://localhost:3000/api/v1/products
```

**Nota:** El dominio debe estar registrado en la base de datos en el campo `domain` de la entidad `Company`.

### Aislamiento de Datos

- ✅ Cada operación CRUD filtra automáticamente por `companyId`
- ✅ Los productos solo son visibles para su company correspondiente
- ✅ No se puede acceder a productos de otros companies
- ✅ El `companyId` se asigna automáticamente al crear productos
- ✅ Todas las queries incluyen el filtro de company automáticamente

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
# O usando el dominio (el company se identifica automáticamente) Desde: https://mitienda.com
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
# O usando dominio (el company se identifica automáticamente)
GET api/v1/products
Origin: https://mitienda.com
```

**Respuesta:** Solo retorna los productos del company correspondiente (identificado por API Key o dominio).

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

**Nota:** Si el producto con ID 1 no pertenece al company identificado, retornará 404.

### Entidad Company

Cada company tiene la siguiente estructura:

```typescript
{
  id: number;              // ID único del company
  name: string;            // Nombre del company
  domain: string;          // Dominio completo (ej: "mitienda.com") (opcional)
  apiKey: string;         // API Key única (opcional)
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de actualización
}
```

**Nota:** El company debe tener al menos uno de los siguientes campos configurado: `domain` o `apiKey`.

### Seguridad

- ✅ Validación automática del company en cada request
- ✅ Aislamiento completo de datos entre companies
- ✅ No se puede acceder a datos de otros companies
- ✅ Validación de existencia del company antes de procesar requests

Algunos de los endpoints requieren identificar el company mediante:
- Header `x-api-key` con la API Key del company, o
- Dominio completo en la URL desde donde se hace la consulta

## Componentes

### Guard (`company.guard.ts`)
**Protege todos los endpoints que usan `@UseGuards(TenantGuard)`**

Flujo:
1. Extrae company del request por API Key o dominio
2. Si no encuentra company → Lanza `UnauthorizedException`
3. Si encuentra company → Guarda en `TenantContext` para acceso posterior
4. Permite continuar con el request

**Métodos de extracción** (en orden de prioridad):
- Header `x-api-key` → Busca por apiKey
- Header/Origin `origin` → Busca por dominio

### Service: TenantContext (`company-context.service.ts`)
**Scope REQUEST** - Se crea una instancia por cada request

Gestiona el contexto del company actual en ese request:
```typescript
setCompanyData(data)        // Establece datos del company
getCompanyId()                     // Obtiene ID
getCompanyDomain()                 // Obtiene dominio
getCompanyCompany()                // Obtiene empresa
getCompanySMTP()                  // Obtiene credenciales email
getCompanySpreadsheets()           // Obtiene ID Google Sheets
getTanantMercadopago()            // Obtiene token Mercadopago
```

**Uso**: Otros servicios inyectan este servicio para acceder a datos del company actual.

## Flujo de Autenticación Multi-Company

```
1. Cliente envía request con x-api-key o desde origen específico
2. TenantGuard intercepta
3. Guard extrae company mediante API Key o dominio
4. Si no existe → 401 Unauthorized
5. Guard guarda company en TenantContext
6. Otros servicios acceden al company actual via TenantContext
7. Request se procesa en contexto del company específico
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

### Acceder Datos del Company Actual (desde un Servicio)
```typescript
constructor(private tenantContext: TenantContext) {}

async sendEmail() {
  const companyId = this.tenantContext.getCompanyId();
  const email = this.tenantContext.getCompanySMTP();
  // Usa estos datos...
}
```

## Puntos Importantes para Mantenimiento

### Seguridad
- **Scope REQUEST**: `TenantContext` se crea por request → No hay mezcla de datos entre companies
- **Select selectivo**: Queries solo retornan campos necesarios (ej: no retorna password en FindByApiKey)
- **Hashing**: Contraseñas hasheadas con bcrypt, nunca almacenadas en texto plano

### Integración
- **Módulo Global**: El CoreModule es `@Global()` → Disponible en toda la app
- **Exporta**: Guard, Interceptor y Services se exportan para uso en otros módulos
- **Multi-company automático**: Servicios que usan `TenantContext` obtienen datos del company actual automáticamente

### Métodos No Usados
- `findAll()` - Traería todos los companies (comentado/no usado)
- `TenantInterceptor` - Duplicado, el Guard ya maneja el contexto
