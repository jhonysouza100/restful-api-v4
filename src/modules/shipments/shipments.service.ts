import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TenantContextService } from '../../core/tenant/tenant.context';
import { GenerateMiCorreoRatesDto } from './dto/generate-micorreo-rates.dto';
import { ImportMiCorreoShipmentDto } from './dto/import-micorreo-shipment.dto';
import { MiCorreoAgenciesResponseInterface } from './interfaces/micorreo-agencies.interface';
import { MiCorreoRatesResponseInterface } from './interfaces/micorreo-rates.interface';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly tenantContextService: TenantContextService,
  ) { }

  private async getMiCorreoToken(credentials?: { user?: string, password?: string }): Promise<string> {
    try {
      const user = credentials?.user || this.tenantContextService.getMiCorreoCredentials()?.user;
      const password = credentials?.password || this.tenantContextService.getMiCorreoCredentials()?.password;
      const bufferCredentials = Buffer.from(`${user}:${password}`).toString("base64");
      const response = await fetch("https://api.correoargentino.com.ar/micorreo/v1/token", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${bufferCredentials}`
        }
      });
      const responseData: { expire: string, token: string } = await response.json();

      return responseData.token;
    } catch (error: any) {
      throw new HttpException(`${error.message}`, HttpStatus.UNAUTHORIZED);
    }
  }

  async getMiCorreoRates(data: GenerateMiCorreoRatesDto): Promise<MiCorreoRatesResponseInterface> {
    const token = await this.getMiCorreoToken();

    return new Promise((resolve, reject) => {
      fetch("https://api.correoargentino.com.ar/micorreo/v1/rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          customerId: this.tenantContextService.getMiCorreoCredentials()?.customer_id,
          postalCodeOrigin: this.tenantContextService.getMiCorreoCredentials()?.postal_code
        }),
      }).then((response) => response.json())
        .then((response) => {
          const rates: MiCorreoRatesResponseInterface = response;
          resolve(rates);
        }).catch((error: any) => {
          reject();
          throw new HttpException(`${error.message}`, error.status);
        });
    })
  }

  async importMiCorreoShipment(
    data: ImportMiCorreoShipmentDto,
    credentials?: {
      user?: string,
      password?: string,
      customer_id?: string
    }): Promise<{ createdAt: string }> {

    const token = await this.getMiCorreoToken({
      user: credentials?.user,
      password: credentials?.password
    });

    return new Promise((resolve, reject) => {

      const body = {
        ...data,
        customerId: credentials?.customer_id || this.tenantContextService.getMiCorreoCredentials()?.customer_id,
        sender: {
          ...data?.sender,
          name: data.sender?.name || this.tenantContextService.getFullName()
        }
      }

      fetch("https://api.correoargentino.com.ar/micorreo/v1/shipping/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })
        .then((response) => response.json())
        .then((response) => {
          const shipingImported: { createdAt: string } = response;
          resolve(shipingImported);
        })
        .catch((error: any) => {
          reject({ created: `No se puedo crear el envío en MiCorreo: ${error.message}` });
        });
    })

    /** OK RESPONSE.
     * HTTP/1.1 200 OK
     * x-powered-by: Undertow/1
     * access-control-allow-headers: Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With
     * server: JBoss-EAP/7
     * access-control-expose-headers: Authorization
     * date: Mon, 27 Jul 2026 00:39:36 GMT
     * access-control-allow-origin: *
     * content-type: application/json; charset=utf-8
     * access-control-allow-methods: POST, GET
     * connection: close
     * Strict-Transport-Security: max-age=16070400; includeSubDomains; preload
     * Transfer-Encoding: chunked
       
      {
        "createdAt": "2026-07-26T21:39:36.044-03:00"
      }
     */
  }

  async getMiCorreoAgencies(query: Record<string, string> = {}) {
    const { provinceCode } = query;
    const token = await this.getMiCorreoToken();

    return new Promise((resolve, reject) => {
      fetch(`https://api.correoargentino.com.ar/micorreo/v1/agencies?customerId=${this.tenantContextService.getMiCorreoCredentials()?.customer_id}&provinceCode=${provinceCode}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }).then((response) => response.json())
        .then((response) => {
          const agencies: MiCorreoAgenciesResponseInterface = response;
          resolve(agencies);
        }).catch((error: any) => {
          reject();
          throw new HttpException(`${error.message}`, error.status);
        });
    })
  }
}