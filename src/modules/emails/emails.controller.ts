import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, } from  '@nestjs/common';
import { ApiCreatedResponse, ApiHeader, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';
import { EmailsService } from './emails.service';
import { EmailCreatedResponse, EmailErrorResponse } from './interfaces/emails-response.interface';
import { SendEmailDto } from './dtos/send-mail.dto';
import { TenantGuard } from 'src/core/guards/tenant.guard';

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
  async senMail(@Body() data: SendEmailDto) {
    return await this.emailsService.sendMail(data);
  }
}