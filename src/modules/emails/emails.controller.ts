import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, } from '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TenantGuard } from '../../core/guards/tenant.guard';
import { SendEmailDto } from './dtos/send-mail.dto';
import { EmailsService } from './emails.service';
import { EmailCreatedResponse, EmailErrorResponse } from './interfaces/emails-response.interface';

@ApiTags('Emails')
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key (optional if using domain)',
  required: false,
})
@UseGuards(TenantGuard)
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send an email', description: 'Sends an email using the provided data.' })
  @ApiCreatedResponse({
    description: 'Email sent successfully',
    type: EmailCreatedResponse
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Tenant identification required. Provide x-api-key header or use domain in URL',
    type: EmailErrorResponse
  })
  async sendMail(@Body() data: SendEmailDto) {
    return await this.emailsService.sendMail(data);
  }
}