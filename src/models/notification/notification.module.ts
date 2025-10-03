import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { EmailSendService } from 'src/lib/services/email/email-send';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, EmailSendService],
  exports: [NotificationService],
})
export class NotificationModule {}
