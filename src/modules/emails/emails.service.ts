import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailCredentialsDto } from 'src/core/dtos/tenant.dto';
import { TenantContextService } from 'src/core/services/tenant-context.service';
import { SendEmailDto } from 'src/modules/emails/dtos/send-mail.dto';

@Injectable()
export class EmailsService {
  constructor(private readonly tenantContextService: TenantContextService) {}

  private getTenatEmail(): EmailCredentialsDto {
    return this.tenantContextService.getTenatEmail();
  }

  async sendMail(data: SendEmailDto) {
    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: this.getTenatEmail().user,
        pass: this.getTenatEmail().pass
      }
    });

    try {
      const response = await transporter.sendMail({
        from: `"${data.from}" <${this.getTenatEmail().user}>`,
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