import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { IMailService } from './interfaces/mail.service.interface';

@Module({
  providers: [
    {
      provide: IMailService,
      useClass: MailService,
    },
  ],
  exports: [IMailService],
})
export class MailModule {}
