import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (!host || !user || !pass || user === 'placeholder_user') {
      this.logger.warn('SMTP is not configured (or is using placeholders). Email sending will be logged to console.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: {
          user,
          pass,
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to initialize nodemailer transporter: ${error.message}`);
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = this.configService.get<string>('mail.from') ?? 'no-reply@shortx.com';

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
        this.logger.error(`Failed to send email to ${to} via SMTP: ${error.message}`);
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
