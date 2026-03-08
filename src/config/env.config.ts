import { z } from 'zod';
import 'dotenv/config';

/**
 * Esquema de validación para variables de entorno
 * Define las variables requeridas y opcionales del proyecto
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().min(1, 'PORT is required.').transform(Number),
  ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required.').transform((val) => val.split(',').map((origin) => origin.trim())),
  MONGO_DB_URL: z.string().min(1, 'MONGO_DB_URL is required.'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required.'),
  DATABASE_HOST: z.string().min(1, 'DATABASE_HOST is required.'),
  DATABASE_PORT: z.string().min(1, 'DATABASE_PORT is required.').transform(Number),
  DATABASE_NAME: z.string().min(1, 'DATABASE_NAME is required.'),
  DATABASE_USERNAME: z.string().min(1, 'DATABASE_USERNAME is required.'),
  DATABASE_PASSWORD: z.string().min(1, 'DATABASE_PASSWORD is required.'),
  SERVER_URL: z.string().min(1, 'SERVER_URL is required.'),
  THROTTLER_LIMITER: z.string().min(1, 'THROTTLER_LIMITER is required.').transform(Number),
  ITEMS_PER_PAGE: z.string().min(1, 'ITEMS_PER_PAGE is required.').transform(Number),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required.'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required.'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required.'),
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
export const env = validateEnv();
