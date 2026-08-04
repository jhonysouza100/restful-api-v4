import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TenantContextService } from '../../core/tenant/tenant.context';
import { SendEmailDto } from './dtos/send-mail.dto';

@Injectable()
export class EmailsService {
  constructor(private readonly tenantContextService: TenantContextService) {}

  private getTenantSMTP(): { user: string, pass: string } {
    console.log("ANTES DE OBTENER LAS PRIVATE_KEYS")
    return this.tenantContextService.getTenantSMTP();
  }

  async sendMail(data: SendEmailDto, files: Express.Multer.File[] = [], credentials?: {
      user: string,
      pass: string
    }) {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: credentials?.user || this.getTenantSMTP().user,
        pass: credentials?.pass || this.getTenantSMTP().pass
      }
    });

    const attachments = [
      ...(data.attachments ?? []).map((attachment) => ({
        filename: attachment.filename,
        contentType: attachment.contentType,
      })),
      ...files.map((file) => ({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      }))
    ];

    try {
      const response = await transporter.sendMail({
        from: `"${data.from}" <${credentials?.user || this.getTenantSMTP().user}>`,
        to: data.to,
        attachments,
        subject: data.subject,
        html: data.htmlContent
      });
      return response.envelope;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}