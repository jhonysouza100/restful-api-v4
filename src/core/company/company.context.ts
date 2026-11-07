import { Injectable, Scope } from '@nestjs/common';
import {
  CorreoArgentinoDto,
  CreatePrivateKeysDto,
} from './dtos/update-company.dto';

/**
 * CompanyContext
 *
 * Servicio de contexto multi-company con SCOPE REQUEST.
 *
 * IMPORTANTE: Se crea UNA INSTANCIA por cada HTTP request.
 * Esto asegura que cada request tenga datos del company aislados
 * sin riesgo de contaminación entre requests concurrentes.
 *
 * Uso:
 * - El CompanyGuard establece el contexto: setCompanyData()
 * - Otros servicios acceden inyectando este servicio
 * - Los datos se limpian automáticamente al terminar el request
 */
@Injectable({ scope: Scope.REQUEST })
export class CompanyContext {
  /**
   * Almacena datos del company actual
   * Se limpia automáticamente al finalizar el request
   */
  private companyData: {
    id: number;
    email: string;
    domain: string;
    company: string;
    fullName: string;
    private_keys: CreatePrivateKeysDto;
  };

  /**
   * Establece las credenciales del company actual
   * Llamado por CompanyGuard después de validar el company
   *
   * @param data - Datos del company (id, email, domain, etc.)
   */
  setCompanyData(data: {
    id: number;
    email: string;
    domain: string;
    company: string;
    fullName: string;
    private_keys: CreatePrivateKeysDto;
  }): void {
    this.companyData = {
      id: data.id,
      email: data.email,
      domain: data.domain,
      company: data.company,
      fullName: data.fullName,
      private_keys: data.private_keys,
    };
  }

  /**
   * Obtiene el ID del company actual
   * @returns ID del company
   */
  getCompanyId(): number {
    return this.companyData.id;
  }

  /**
   * Obtiene el dominio del company actual
   * @returns Dominio personalizado
   */
  getCompanyDomain(): string {
    return this.companyData.domain;
  }

  /**
   * Obtiene el nombre de la empresa del company actual
   * @returns Nombre de empresa
   */
  getCompanyCompany(): string {
    return this.companyData.company;
  }

  /**
   * Obtiene el nombre completo del company actual
   * @returns Nombre completo del proprietario
   */
  getFullName(): string {
    return this.companyData.fullName;
  }

  /**
   * Obtiene las credenciales de email (SMTP) del company actual
   * @returns EmailCredentialsDto {user, pass}
   */
  getCompanySMTP(): { user: string; pass: string } {
    return {
      user: this.companyData.email,
      pass: this.companyData.private_keys?.smtp || '',
    };
  }

  /**
   * Obtiene el token de Mercadopago del company actual
   * @returns Token Mercadopago o undefined
   */
  getTanantMercadopago(): string {
    return this.companyData.private_keys?.mercadopago || '';
  }

  /**
   * Obtiene las credenciales de Correo Argentino
   * @returns CorreoArgentinoDto
   */
  getMiCorreoCredentials(): CorreoArgentinoDto | undefined {
    return this.companyData.private_keys.correo_argentino;
  }

  /**
   * Obtiene el ID de Google Sheets del company actual
   * @returns ID de la hoja de cálculo
   */
  getCompanySpreadsheets(): string {
    return this.companyData.private_keys?.spreadsheets || '';
  }
}
