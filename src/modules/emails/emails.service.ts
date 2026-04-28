import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TenantContextService } from '../../core/tenant/tenant.context';
import { SendEmailDto } from './dtos/send-mail.dto';

@Injectable()
export class EmailsService {
  constructor(private readonly tenantContextService: TenantContextService) {}

  private getTenantSMTP(): { user: string, pass: string } {
    return this.tenantContextService.getTenantSMTP();
  }

  async sendMail(data: SendEmailDto) {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this.getTenantSMTP().user,
        pass: this.getTenantSMTP().pass
      }
    });

    try {
      const response = await transporter.sendMail({
        from: `"${data.from}" <${this.getTenantSMTP().user}>`,
        to: data.to,
        attachments: [...data.attachments || []],
        subject: data.subject,
        html: data.htmlContent
      });
      return response.envelope;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}