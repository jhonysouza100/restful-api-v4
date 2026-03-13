# Módulo de Emails

## Descripción General
Módulo responsable de enviar emails utilizando Nodemailer y Gmail. Implementa autenticación basada en inquilinos (multi-tenant) con validación de API Key y dominio.

## Funcionalidad Principal

### Endpoint
- **POST** `/emails` - Envía un email
- Requiere `TenantGuard` para validar el tenant (mediante header `x-api-key` o dominio)
- Retorna `201 Created` con información del envelope

## Estructura de Datos

### DTO (`send-mail.dto.ts`)
Estructura de entrada para enviar emails:
```typescript
SendEmailDto {
  from: string                    // Nombre del remitente
  to: string[]                    // Array de correos destinatario
  subject: string                 // Asunto del email
  htmlContent: string             // Contenido HTML
  attachments?: EmailAttachments[] // Adjuntos opcionales
}

EmailAttachments {
  path: string           // Ruta del archivo
  filename: string       // Nombre del archivo adjunto
  contentType?: string   // MIME type (opcional)
}
```

### Response Interfaces (`emails-response.interface.ts`)
- **Éxito**: `EmailCreatedResponse` - Contiene `from` y `to`
- **Error**: `EmailErrorResponse` - Contiene `message`, `error`, `statusCode`

## Flujo de Ejecución

1. Cliente envía POST a `/emails` con `SendEmailDto` y header `x-api-key`
2. `TenantGuard` valida el tenant
3. `EmailsService` obtiene credenciales del tenant del contexto
4. Crea transporter de Nodemailer con Gmail
5. Envía email con Nodemailer
6. Retorna envelope o lanza excepción

## Configuración Requerida

Cada tenant debe tener configuradas sus credenciales de Gmail en la base de datos:
- **user**: Correo de Gmail del tenant
- **pass**: Contraseña o app password de Gmail

## Ejemplo de Uso

```bash
POST /emails
Headers: x-api-key: tu-api-key

{
  "from": "Mi Aplicación",
  "to": ["usuario@example.com"],
  "subject": "Bienvenido",
  "htmlContent": "<h1>Hola</h1>",
  "attachments": [
    {
      "path": "/ruta/al/archivo.pdf",
      "filename": "documento.pdf"
    }
  ]
}
```

## Puntos Importantes para Mantenimiento

- **Multi-tenant**: Las credenciales se obtienen del contexto actual del tenant
- **Seguridad**: Validación obligatoria mediante `TenantGuard`
- **Errores**: Se capturan excepciones de Nodemailer y se retornan como `HttpException`
- **Attachments**: Soporta archivos adjuntos con personalización de nombres y tipos MIME
- **Gmail SMTP**: Usar contraseña de aplicación específica para Gmail (no contraseña regular si 2FA está activo)
