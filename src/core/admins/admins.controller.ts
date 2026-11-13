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
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@ApiTags('Admins')
@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @UseRoleAuthToken(Role.ROOT)
  @ApiOperation({
    summary: 'Crear administrador',
    description: 'Crea un nuevo administrador.',
  })
  @ApiBody({
    type: CreateAdminDto,
    description: 'Datos necesarios para crear un administrador.',
  })
  create(@Body() createAdminDto: CreateAdminDto) {
    try {
      return this.adminsService.create(createAdminDto);
    } catch (error: any) {
      return error.message;
    }
  }

  @Patch(':id')
  @UseRoleAuthToken(Role.ROOT)
  @ApiOperation({
    summary: 'Actualizar administrador',
    description: 'Actualiza un administrador existente por su id.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador numérico del administrador.',
    example: 1,
  })
  @ApiBody({
    type: UpdateAdminDto,
    description: 'Datos que se pueden modificar del administrador.',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdminDto: UpdateAdminDto,
  ) {
    try {
      return this.adminsService.update(id, updateAdminDto);
    } catch (error: any) {
      return error.message;
      
    }
  }
}
