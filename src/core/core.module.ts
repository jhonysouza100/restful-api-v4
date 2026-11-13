import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../common/constants';
import { AdminsController } from './admins/admins.controller';
import { AdminsService } from './admins/admins.service';
import { AdminEntity } from './admins/entities/admin.entity';
import { AutenticationContext } from './auth/auth.context';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CompaniesController } from './company/companies.controller';
import { CompaniesService } from './company/companies.service';
import { CompanyEntity } from './company/entities/company.entity';
import { TenantInterceptor } from './tenant/interceptors/tenant.interceptor';
import { TenantContext } from './tenant/tenant.context';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([CompanyEntity, AdminEntity]),
  ],
  controllers: [CompaniesController, AdminsController, AuthController],
  providers: [
    TenantContext,
    CompaniesService,
    AdminsService,
    TenantInterceptor,
    AuthService,
    AutenticationContext,
    JwtService,
  ],
  exports: [
    TenantContext,
    CompaniesService,
    AdminsService,
    TenantInterceptor,
    AutenticationContext,
    JwtService,
  ],
})
export class CoreModule {}
