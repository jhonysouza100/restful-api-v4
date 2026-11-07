import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/enums/roles.enum';
import { UseRoleAuthToken } from '../auth/decorators/auth.decorator';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { CompaniesService } from './companies.service';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseRoleAuthToken(Role.ROOT)
  @ApiOperation({
    summary: 'Crear company',
    description: 'Crea un nuevo company con la información proporcionada.',
  })
  @ApiBody({
    type: CreateCompanyDto,
    description: 'Datos necesarios para crear un company.',
  })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    try {
      return this.companiesService.create(createCompanyDto);
    } catch (error) {
      return error.message;
    }
  }

  @Patch(':id')
  @UseRoleAuthToken(Role.ROOT)
  @ApiOperation({
    summary: 'Actualizar company',
    description: 'Actualiza los datos de un company existente por su id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del company.',
    example: 1,
  })
  @ApiBody({
    type: UpdateCompanyDto,
    description: 'Datos que se pueden modificar del company.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    try {
      return this.companiesService.update(id, updateCompanyDto);
    } catch (error) {
      return error.message;
    }
  }
}
