import { Injectable, Scope } from '@nestjs/common';
import { EmailCredentialsDto } from '../dtos/tenant.dto';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantData: {
    id: number,
    email: EmailCredentialsDto,
    domain: string,
    company: string,
    mercadopago: string,
    spreadsheets: string,
  };

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

  getTenantId(): number {
    return this.tenantData.id;
  }

  getTenatEmail(): EmailCredentialsDto {
    return this.tenantData.email;
  }

  getTanantMercadopago(): String {
    return this.tenantData.mercadopago;
  }

  getTenantDomain(): String {
    return this.tenantData.domain;
  }

  getTenantCompany(): string {
    return this.tenantData.company;
  }

  getTenantSpreadsheets(): string {
    return this.tenantData.spreadsheets;
  }
}