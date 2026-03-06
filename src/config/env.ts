import { z } from 'zod';

/**
 * Esquema de validación para variables de entorno
 * Define las variables requeridas y opcionales del proyecto
 */
const envSchema = z.object({
  // Variables obligatorias
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Variables opcionales
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
});

/**
 * Tipo para las variables de entorno validadas
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Valida y carga las variables de entorno
 * Lanza un error si alguna variable requerida falta o es inválida
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Variables de entorno inválidas:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Obtiene la configuración de entorno
 */
export const config = validateEnv();
