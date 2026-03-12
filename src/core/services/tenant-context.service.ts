import { Injectable, Scope } from '@nestjs/common';
import { EmailCredentialsDto } from '../dtos/tenant.dto';

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
 * - El TenantGuard establece el contexto: setTenantCredentials()
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
    email: EmailCredentialsDto,
    domain: string,
    company: string,
    mercadopago: string,
    spreadsheets: string,
  };

  /**
   * Establece las credenciales del tenant actual
   * Llamado por TenantGuard después de validar el tenant
   * 
   * @param data - Datos del tenant (id, email, domain, etc.)
   */
  setTenantCredentials(data: { 
    id: number, 
    email: EmailCredentialsDto, 
    domain: string, 
    company: string,
    mercadopago: string, 
    spreadsheets: string, 
   }): void {
    this.tenantData = {
      id: data.id,
      email: {
        pass: data.email.pass,
        user: data.email.user
      },
      domain: data.domain,
      mercadopago: data.mercadopago,
      spreadsheets: data.spreadsheets,
      company: data.company,
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
   * Obtiene las credenciales de email (SMTP) del tenant actual
   * @returns EmailCredentialsDto {user, pass}
   */
  getTenantEmail(): EmailCredentialsDto {
    return this.tenantData.email;
  }

  /**
   * Obtiene el token de Mercadopago del tenant actual
   * @returns Token Mercadopago o undefined
   */
  getTanantMercadopago(): String {
    return this.tenantData.mercadopago;
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
   * Obtiene el ID de Google Sheets del tenant actual
   * @returns ID de la hoja de cálculo
   */
  getTenantSpreadsheets(): string {
    return this.tenantData.spreadsheets;
  }
}