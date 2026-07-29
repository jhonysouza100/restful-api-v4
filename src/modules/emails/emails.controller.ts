import { BadRequestException, Body, Controller, HttpCode, HttpStatus, PipeTransform, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCreatedResponse, ApiExtraModels, ApiHeader, ApiOperation, ApiTags, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { UseTenantGuard } from '../../core/tenant/decorators/tenant.decorator';
import { SendEmailDto } from './dtos/send-mail.dto';
import { EmailsService } from './emails.service';
import { EmailCreatedResponse, EmailErrorResponse } from './interfaces/emails-response.interface';

class ParseJSONPipe implements PipeTransform {
  transform(value: unknown) {
    if (value === null || value === undefined) {
      return {};
    }

    if (typeof value === 'object') {
      return value;
    }

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        throw new BadRequestException('Invalid JSON format');
      }
    }

    throw new BadRequestException('Invalid JSON format');
  }
}

@UseTenantGuard()
@ApiTags('Emails')
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key (optional if using domain)',
  required: false,
})
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar correo electrónico', description: 'Envía correos usando multipart/form-data. El campo `email` debe contener un JSON y el campo `files` acepta hasta 10 archivos adjuntos en formato PDF o imagen.' })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'Email sent successfully',
    type: EmailCreatedResponse
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Tenant identification required. Provide x-api-key header or use domain in URL',
    type: EmailErrorResponse
  })
  @ApiConsumes('multipart/form-data')
  /**
   * Si quieres que Swagger muestre la estructura del DTO,
   * email debe referenciarse con $ref: getSchemaPath(SendEmailDto) y
   * debes usar @ApiExtraModels(SendEmailDto) para que el modelo se incluya en la documentación.
   */
  @ApiExtraModels(SendEmailDto)
  @ApiBody({
    description: 'Email payload en el form-data: email como string JSON y archivos PDF/imagen opcionales en el campo files.',
    schema: {
      type: 'object',
      properties: {
        email: {
          $ref: getSchemaPath(SendEmailDto)
        },
        files: {
          type: 'array',
          description: 'Archivos PDF o de imagen opcionales para adjuntar al correo electrónico.',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['email'],
    },
  })
  /**
   * Interceptor para manejar la carga de archivos. Permite hasta 10 archivos y filtra por tipos MIME permitidos (PDF e imágenes).
   * Si el archivo no es de un tipo permitido, se lanza un error.
   * Los archivos se reciben en el campo 'files' del form-data.
   * El campo 'email' del form-data debe contener un string JSON que represente el DTO SendEmailDto.
   * Se utiliza un pipe ParseJSONPipe para convertir el string JSON en un objeto JavaScript.
   * El pipe ParseJSONPipe valida que el string sea un JSON válido y lanza una excepción si no lo es.
   */
  @UseInterceptors(FilesInterceptor('files', 10, {
    fileFilter: (_req, file, callback) => {
      const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
        return;
      }

      callback(new Error('Only PDF and image files are allowed'), false);
    },
  }))
  async sendMail(@Body('email', ParseJSONPipe) data: SendEmailDto, @UploadedFiles() files: Express.Multer.File[] = []) {
    try {
      return await this.emailsService.sendMail(data, files);
    } catch (error: any) {
      return error.message;
    }
  }
}