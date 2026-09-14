import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../common/constants';
import { AdminContext } from './auth/auth.context';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { TenantEntity } from './tenant/entities/tenant.entity';
import { TenantInterceptor } from './tenant/interceptors/tenant.interceptor';
import { TenantContext } from './tenant/tenant.context';
import { TenantsController } from './tenant/tenants.controller';
import { TenantsService } from './tenant/tenants.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }
    }),
    TypeOrmModule.forFeature([TenantEntity]),
  ],
  controllers: [TenantsController, AuthController],
  providers: [TenantContext, TenantsService, TenantInterceptor, AuthService, AdminContext, JwtService],
  exports: [TenantContext, TenantsService, TenantInterceptor, AdminContext, JwtService]
})
export class CoreModule {}