import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CompanyEntity } from '../entities/company.entity';
import { CompanyContext } from '../company.context';
import { CompaniesService } from '../companies.service';

/**
 * CompanyGuard
 *
 * Guard que valida y establece el contexto del company para cada request.
 * TODOS los endpoints que usen @UseGuards(CompanyGuard) estarán protegidos
 * y tendrán acceso al company actual mediante CompanyContext.
 *
 * Métodos de identificación (en orden):
 * 1. Header x-api-key -> busca por API Key
 * 2. Header Origin -> busca por dominio
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(
    private readonly companyContext: CompanyContext,
    private readonly companiesService: CompaniesService,
  ) {}

  /**
   * Valida que el request tenga un company válido
   *
   * @param context - Contexto de ejecución
   * @returns true si el company es válido
   * @throws UnauthorizedException si el company no se encuentra
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const company = await this.extractCompanyData(request);

    if (!company) {
      throw new UnauthorizedException(
        'Company identification required. Provide x-api-key header or use domain in URL',
      );
    }

    // Guarda las credenciales del company en el servicio de contexto
    // Otros servicios pueden acceder al company actual inyectando CompanyContext
    this.companyContext.setCompanyData(company);

    // No se esta usando, !!! Su implementacion requiere acceder a los request en todos los endpoints (Mucho codigo).
    request.company = company;

    return true;
  }

  /**
   * Extrae los datos del company del request
   * Intenta identificar por API Key primero, luego por dominio
   *
   * @param request - Request HTTP
   * @returns CompanyEntity si se encuentra, null en caso contrario
   */
  private async extractCompanyData(request: any): Promise<CompanyEntity | null> {
    const apiKey = request.headers['x-api-key'];
    const origin = request.origin || request.headers['origin'] || '';

    // Intenta buscar por API Key (mayor prioridad)
    if (apiKey) {
      const company = await this.companiesService.findByApiKey(apiKey);
      if (company) {
        return company;
      }
    }

    // Intenta buscar por dominio/origen
    if (origin) {
      const company = await this.companiesService.findByDomain(origin);
      if (company) {
        return company;
      }
    }

    return null;
  }
}
