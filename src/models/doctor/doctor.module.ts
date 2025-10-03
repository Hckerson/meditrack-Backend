import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [AppointmentModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
