import { Injectable, Inject } from '@nestjs/common';
import type { Env } from 'src/common/config/env.config';

@Injectable()
export class AppService {
  constructor(@Inject('CONFIG') private config: Env) {}

  getHello(): string {
    // acceso a las variables de entorno tipadas desde Zod
    const envName = this.config.NODE_ENV;
    const port = this.config.PORT;
    return `Hello World! (env: ${envName}, port: ${port})`;
  }
}
