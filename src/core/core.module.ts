import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from '../common/constants';
import { TenantEntity } from './tenant/entities/tenant.entity';
import { TenantInterceptor } from './tenant/interceptors/tenant.interceptor';
import { TenantContextService } from './tenant/tenant.context';
import { TenantsController } from './tenant/tenants.controller';
import { TenantsService } from './tenant/tenants.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthContextRequest } from './auth/auth.context';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d'}
    }),
    TypeOrmModule.forFeature([TenantEntity]),
  ],
  controllers: [TenantsController, AuthController],
  providers: [TenantContextService, TenantsService, TenantInterceptor, AuthService, AuthContextRequest, JwtService],
  exports: [TenantContextService, TenantsService, TenantInterceptor, AuthContextRequest, JwtService]
})
export class CoreModule {}