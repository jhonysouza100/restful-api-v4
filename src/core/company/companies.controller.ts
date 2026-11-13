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
import { UseRoleAuthToken } from '../auth/decorators/auth.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { RootUpdateCompanyDto } from './dtos/update-company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @UseRoleAuthToken(Role.ADMIN)
  @ApiOperation({
    summary: 'Listar compañías del administrador',
    description:
      'Retorna las compañías asociadas al administrador autenticado con sus datos públicos.',
  })
  async findByAdmin() {
    return this.companiesService.findAllByAdmin();
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
    return this.companiesService.create(createCompanyDto);
  }

  @Patch(':id')
  @UseRoleAuthToken(Role.ROOT)
  @ApiOperation({
    summary: 'Actualizar company',
    description: 'Actualiza los datos de un company existente por su id. (Actualmente solo un administrador con rol ROOT puede actualizar a otro company).',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del company.',
    example: 1,
  })
  @ApiBody({
    type: RootUpdateCompanyDto,
    description: 'Datos que se pueden modificar del company.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() rootUpdateCompanyDto: RootUpdateCompanyDto,
  ) {
    return this.companiesService.rootUpdate(id, rootUpdateCompanyDto);
  }
}
