import { Injectable, Scope } from '@nestjs/common';
import { CreatePrivateKeysDto } from '../dtos/update-tenant.dto';

/**
 * TenantContextService
 * 
 * Servicio de contexto multi-tenant con SCOPE REQUEST.
 * 
 * IMPORTANTE: Se crea UNA INSTANCIA por cada HTTP request.
 * Esto asegura que cada request tenga datos del tenant aislados
 * sin riesgo de contaminación entre requests concurrentes.
 * 
 * Uso:
 * - El TenantGuard establece el contexto: setTenantData()
 * - Otros servicios acceden inyectando este servicio
 * - Los datos se limpian automáticamente al terminar el request
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  /**
   * Almacena datos del tenant actual
   * Se limpia automáticamente al finalizar el request
   */
  private tenantData: {
    id: number,
    email: string,
    domain: string,
    company: string,
    private_keys: CreatePrivateKeysDto
  };

  /**
   * Establece las credenciales del tenant actual
   * Llamado por TenantGuard después de validar el tenant
   * 
   * @param data - Datos del tenant (id, email, domain, etc.)
   */
  setTenantData(data: { 
    id: number, 
    email: string, 
    domain: string, 
    company: string,
    private_keys: CreatePrivateKeysDto
   }): void {
    this.tenantData = {
      id: data.id,
      email: data.email,
      domain: data.domain,
      company: data.company,
      private_keys: data.private_keys
    };
  }

  /**
   * Obtiene el ID del tenant actual
   * @returns ID del tenant
   */
  getTenantId(): number {
    return this.tenantData.id;
  }

  /**
   * Obtiene el dominio del tenant actual
   * @returns Dominio personalizado
   */
  getTenantDomain(): String {
    return this.tenantData.domain;
  }

  /**
   * Obtiene el nombre de la empresa del tenant actual
   * @returns Nombre de empresa
   */
  getTenantCompany(): string {
    return this.tenantData.company;
  }

  /**
   * Obtiene las credenciales de email (SMTP) del tenant actual
   * @returns EmailCredentialsDto {user, pass}
   */
  getTenantSMTP(): { user: string, pass: string } {
    return {
      user: this.tenantData.email,
      pass: this.tenantData.private_keys?.smtp || ''
    };
  }

  /**
   * Obtiene el token de Mercadopago del tenant actual
   * @returns Token Mercadopago o undefined
   */
  getTanantMercadopago(): String {
    return this.tenantData.private_keys?.mercadopago || '';
  }

  /**
   * Obtiene el ID de Google Sheets del tenant actual
   * @returns ID de la hoja de cálculo
   */
  getTenantSpreadsheets(): string {
    return this.tenantData.private_keys?.spreadsheets || '';
  }
}