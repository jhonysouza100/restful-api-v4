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
