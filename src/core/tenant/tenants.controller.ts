import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { UpdateTenantDto } from './dtos/update-tenant.dto';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear tenant', description: 'Crea un nuevo tenant con la información proporcionada.' })
  @ApiBody({ type: CreateTenantDto, description: 'Datos necesarios para crear un tenant.' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    try {
      return this.tenantsService.create(createTenantDto);
    } catch (error) {
      return error.message;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar tenant', description: 'Actualiza los datos de un tenant existente por su id.' })
  @ApiParam({ name: 'id', type: Number, description: 'Identificador numérico del tenant.', example: 1 })
  @ApiBody({ type: UpdateTenantDto, description: 'Datos que se pueden modificar del tenant.' })
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