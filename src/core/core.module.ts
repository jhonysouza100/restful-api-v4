import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantEntity } from './entities/tenant.entity';
import { TenantContextService } from './services/tenant-context.service';
import { TenantsService } from './services/tenants.service';
import { TenantGuard } from './guards/tenant.guard';
import { TenantInterceptor } from './interceptors/tenant.interceptor';
import { TenantsController } from './controllers/tenants.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([TenantEntity])],
  providers: [TenantContextService, TenantsService, TenantGuard, TenantInterceptor],
  exports: [TenantContextService, TenantsService, TenantGuard, TenantInterceptor],
  controllers: [TenantsController],
})
export class CoreModule {}