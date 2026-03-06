# Implementación de Zod para Variables de Entorno

## Descripción

Se ha implementado **Zod** en tu proyecto NestJS para validar y tipar las variables de entorno de forma robusta y segura.

## Archivos Creados/Modificados

### 1. `src/config/env.ts` (Nuevo)
Archivo de configuración central que:
- Define un esquema con Zod para validar all variables de entorno
- Proporciona un tipo TypeScript (`Env`) para toda la aplicación
- Valida las variables al iniciar la aplicación
- Lanza errores descriptivos si hay variables inválidas o faltantes

**Variables disponibles:**
- `NODE_ENV`: Entorno (development, production, test) - Default: development
- `PORT`: Puerto del servidor - Default: 3000
- `LOG_LEVEL`: Nivel de logs (error, warn, info, debug) - Default: info
- `API_KEY`: Clave API (opcional)
- `DATABASE_URL`: URL de base de datos (opcional)
- `JWT_SECRET`: Secreto para tokens JWT (opcional)

### 2. `.env.example` (Nuevo)
Archivo de referencia que muestra todas las variables de entorno disponibles.

### 3. `src/main.ts` (Modificado)
Actualizado para:
- Importar la configuración validada desde `src/config/env.ts`
- Usar `envConfig.PORT` en lugar de `process.env.PORT`
- Agregar logging al iniciar la aplicación

### 4. `src/app.module.ts` (Modificado)
Actualizado para:
- Proporcionar la configuración como un servicio injectable
- Permitir inyectar la configuración en cualquier componente

## Cómo Usar

### Para acceder a las variables de entorno en servicios:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { Env } from './config/env';

@Injectable()
export class MyService {
  constructor(@Inject('CONFIG') private config: Env) {}

  someMethod() {
    console.log(this.config.PORT);
    console.log(this.config.NODE_ENV);
  }
}
```

### Alternativamente, importar directamente:

```typescript
import { config } from './config/env';

console.log(config.PORT);
```

## Agregar Nuevas Variables

Para agregar nuevas variables de entorno:

1. Edita `src/config/env.ts`
2. Añade la variable en el esquema `envSchema`
3. Actualiza `.env.example`

Ejemplo:
```typescript
const envSchema = z.object({
  // ...variables existentes...
  STRIPE_API_KEY: z.string().optional(),
  MAX_REQUESTS: z.coerce.number().default(100),
});
```

## Instalación del archivo `.env` local

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Completa los valores con tu configuración local
3. **Nunca commits `.env`** (está en `.gitignore`)

## Validación

La validación ocurre automáticamente cuando la aplicación inicia. Si hay problemas:
- Variables requeridas faltando
- Valores con tipo incorrecto
- Valores fuera del rango permitido

La aplicación mostrará un error descriptivo y no iniciará.

## Ventajas de esta Implementación

✓ **Type-safe**: Variables de entorno tipadas en TypeScript
✓ **Validación automática**: Detecta problemas al iniciar
✓ **Valores por defecto**: Valores sensatos para variables opcionales
✓ **Mensajes de error claros**: Sabe exactamente qué está mal
✓ **Centralizado**: Una única fuente de verdad para la configuración
✓ **Reutilizable**: Fácil de inyectar en cualquier componente
