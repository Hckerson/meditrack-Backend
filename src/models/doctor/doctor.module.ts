import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { PatientModule } from '../patient/patient.module';

@Module({
  imports: [PatientModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
