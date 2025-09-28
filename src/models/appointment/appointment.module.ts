import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService],
})
export class AppointmentModule {}
