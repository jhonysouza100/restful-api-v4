import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TenantEntity } from '../entities/tenant.entity';
import { TenantContextService } from '../tenant.context';
import { TenantsService } from '../tenants.service';

/**
 * TenantGuard
 * 
 * Guard que valida y establece el contexto del tenant para cada request.
 * TODOS los endpoints que usen @UseGuards(TenantGuard) estarán protegidos
 * y tendrán acceso al tenant actual mediante TenantContextService.
 * 
 * Métodos de identificación (en orden):
 * 1. Header x-api-key -> busca por API Key
 * 2. Header Origin -> busca por dominio
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly tenantsService: TenantsService,
  ) {}

  /**
   * Valida que el request tenga un tenant válido
   * 
   * @param context - Contexto de ejecución
   * @returns true si el tenant es válido
   * @throws UnauthorizedException si el tenant no se encuentra
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenant = await this.extractTenantData(request);

    if (!tenant) {
      throw new UnauthorizedException('Tenant identification required. Provide x-api-key header or use domain in URL');
    }

    // Guarda las credenciales del tenant en el servicio de contexto
    // Otros servicios pueden acceder al tenant actual inyectando TenantContextService
    this.tenantContextService.setTenantData(tenant);

    // No se esta usando, !!! Su implementacion requiere acceder a los request en todos los endpoints (Mucho codigo).
    request.tenant = tenant;

    return true;
  }

  /**
   * Extrae los datos del tenant del request
   * Intenta identificar por API Key primero, luego por dominio
   * 
   * @param request - Request HTTP
   * @returns TenantEntity si se encuentra, null en caso contrario
   */
  private async extractTenantData(request: any): Promise<TenantEntity | null> {
    const apiKey = request.headers['x-api-key'];
    const origin = request.origin || request.headers['origin'] || '';

    // Intenta buscar por API Key (mayor prioridad)
    if (apiKey) {
      const tenant = await this.tenantsService.findByApiKey(apiKey);
      if (tenant) {
        return tenant;
      }
    }

    // Intenta buscar por dominio/origen
    if (origin) {
      const tenant = await this.tenantsService.findByDomain(origin);
      if (tenant) {
        return tenant;
      }
    }

    return null;
  }
}