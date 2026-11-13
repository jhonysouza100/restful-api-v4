import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { TenantContext } from '../../core/tenant/tenant.context';
import { SendEmailDto } from './dtos/send-mail.dto';

@Injectable()
export class EmailsService {
  constructor(private readonly tenantContext: TenantContext) {}

  private getCompanySMTP(): { user: string; pass: string } {
    return this.tenantContext.getCompanySMTP();
  }

  async sendMail(
    data: SendEmailDto,
    files: Express.Multer.File[] = [],
    credentials?: {
      user: string;
      pass: string;
    },
  ) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: credentials?.user || this.getCompanySMTP().user,
        pass: credentials?.pass || this.getCompanySMTP().pass,
      },
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
      })),
    ];

    try {
      const response = await transporter.sendMail({
        from: `"${data.from}" <${credentials?.user || this.getCompanySMTP().user}>`,
        to: data.to,
        attachments,
        subject: data.subject,
        html: data.htmlContent,
      });
      return response.envelope;
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
