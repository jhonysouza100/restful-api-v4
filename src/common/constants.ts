import { env } from "./config/env.config";

export const jwtConstants = {
  secret: env.JWT_SECRET,
};

export const ROLES_KEY = 'roles'

export const VALIDATION_KEY = 'validationOpt'