import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST ?? 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT ?? '2525', 10),
  user: process.env.SMTP_USER ?? 'placeholder_user',
  pass: process.env.SMTP_PASS ?? 'placeholder_pass',
  from: process.env.SMTP_FROM ?? 'no-reply@shortx.com',
}));
