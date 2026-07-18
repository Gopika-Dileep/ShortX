import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { IMailService } from './interfaces/mail.service.interface';

@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM');

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          html,
        });
        this.logger.log(`Email successfully sent to ${to}`);
        return;
      } catch (error: any) {
        this.logger.error(
          `Failed to send email to ${to} via SMTP: ${error.message}`,
        );
      }
    }

    this.logger.log(`
========================================
[EMAIL SIMULATION]
From: ${from}
To: ${to}
Subject: ${subject}
Content:
${html}
========================================`);
  }
}
