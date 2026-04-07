import { Body, Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { TenantsService } from '../services/tenants.service';
import { UpdateTenantDto } from 'src/core/dtos/update-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTenantDto: UpdateTenantDto
  ) {
    try {
      return this.tenantsService.update(id, updateTenantDto);
    } catch (error) {
      return error.message;
    }
  }
}