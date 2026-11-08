import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '../../common/enums/roles.enum';
import { AdminContext } from '../auth/auth.context';
import { UseRoleAuthToken } from '../auth/decorators/auth.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly adminContext: AdminContext,
  ) {}

  @Get()
  @UseRoleAuthToken(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar compañías del administrador',
    description:
      'Retorna las compañías activas asociadas al administrador autenticado con sus datos públicos.',
  })
  async findByAdmin() {
    return this.companiesService.findPublicByAdminId(
      this.adminContext.getAuthId(),
    );
  }

  @Post()
  @UseRoleAuthToken(Role.ADMIN)
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
    } catch (error: any) {
      return error.message;
    }
  }

  @Patch(':id')
  @UseRoleAuthToken(Role.ADMIN)
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
    } catch (error: any) {
      return error.message;
    }
  }
}
