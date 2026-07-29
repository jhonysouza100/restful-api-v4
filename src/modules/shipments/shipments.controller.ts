import { Body, Controller, Get, HttpException, Post, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam } from '@nestjs/swagger';
import { UseTenantGuard } from '../../core/tenant/decorators/tenant.decorator';
import { GenerateMiCorreoRatesDto } from './dto/generate-micorreo-rates.dto';
import { ImportMiCorreoShipmentDto } from './dto/import-micorreo-shipment.dto';
import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) { }

  @Post('micorreo/rates')
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  getMiCorreoRates(@Body() generateMiCorreoRatesDto: GenerateMiCorreoRatesDto) {
    try {
      return this.shipmentsService.getMiCorreoRates(generateMiCorreoRatesDto);
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status)
    }
  }

  @Post('micorreo/import')
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  async shipingImport(@Body() data: ImportMiCorreoShipmentDto) {
    try {
      return await this.shipmentsService.importMiCorreoShipment(data);
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status)
    }
  }

  @Get('micorreo/agencies')
  @UseTenantGuard()
  @ApiHeader({ name: 'x-api-key', description: 'API Key (optional if using domain)', required: false })
  @ApiParam({ name: 'provinceCode', description: 'Parametros para búscar sucursales de Correo Argentino' })
  @ApiOperation({ summary: 'Obtener sucursales de Correo Argentino', description: 'Devuelve las sucursales de una provincia determinada.' })
  async getMiCorreoAgencies(@Query() query: Record<string, string>) {
    try {
      return await this.shipmentsService.getMiCorreoAgencies(query)
    } catch (error: any) {
      throw new HttpException(`${error.message}`, error.status);
    }
  }

}
