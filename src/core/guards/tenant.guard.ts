import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { TenantEntity } from 'src/core/entities/tenant.entity';
import { TenantContextService } from 'src/core/services/tenant-context.service';
import { TenantsService } from 'src/core/services/tenants.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly tenantsService: TenantsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenant = await this.extractTenantData(request);

    if (!tenant) {
      throw new UnauthorizedException('Tenant identification required. Provide x-api-key header or use domain in URL');
    }

    this.tenantContextService.setTenantCredentials(tenant);

    // No se esta usando, !!! Su implementacion requiere acceder a los request en todos los endpoints (Mucho codigo).
    request.tenant = tenant;

    return true;
  }

  private async extractTenantData(request: any): Promise<TenantEntity | null> {
    const apiKey = request.headers['x-api-key'];
    const origin = request.origin || request.headers['origin'] || '';
    console.log('Extracting tenant data from request. API Key:', apiKey, 'Origin:', origin);

    if (apiKey) {
      const tenant = await this.tenantsService.findByApiKey(apiKey);
      if (tenant) {
        console.log('Tenant found using API Key:', tenant.name);
        return tenant;
      }
    }

    if (origin) {
      const tenant = await this.tenantsService.findByDomain(origin);
      if (tenant) {
        console.log('Tenant found using Origin:', tenant.name);
        return tenant;
      }
    }

    return null;
  }
}