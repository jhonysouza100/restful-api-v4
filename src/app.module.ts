import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { env } from './config/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsModule } from './modules/emails/emails.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      username: env.DATABASE_USERNAME,
      password: env.DATABASE_PASSWORD,
      database: env.DATABASE_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    EmailsModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'CONFIG',
      useValue: env,
    },
  ],
})
export class AppModule {}
