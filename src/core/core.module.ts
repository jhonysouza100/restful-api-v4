import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../common/constants';
import { AdminContext } from './auth/auth.context';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CompanyEntity } from './company/entities/company.entity';
import { CompanyInterceptor } from './company/interceptors/company.interceptor';
import { CompanyContext } from './company/company.context';
import { CompaniesController } from './company/companies.controller';
import { CompaniesService } from './company/companies.service';
import { AdminsModule } from './admins/admins.module';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([CompanyEntity]),
    AdminsModule,
  ],
  controllers: [CompaniesController, AuthController],
  providers: [
    CompanyContext,
    CompaniesService,
    CompanyInterceptor,
    AuthService,
    AdminContext,
    JwtService,
  ],
  exports: [
    CompanyContext,
    CompaniesService,
    CompanyInterceptor,
    AdminContext,
    JwtService,
  ],
})
export class CoreModule {}
