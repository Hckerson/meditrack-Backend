import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { EmailSendService } from 'src/lib/services/email/email-send';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService,EmailSendService],
})
export class AppointmentModule {}
