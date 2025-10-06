import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Role } from 'generated/prisma';
import { PatientService } from './patient.service';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { createMedicalRecordDto } from './dto/create-medicalrecord.dto';

@Roles(Role.PATIENT)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('record/all')
  async findAllRecord(@User('id') id: string) {
    if (!id) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }
    return this.patientService.fetchAllMedicalRecords(id);
  }

  @Post('medicalrecord/create')
  async createMedicalRecord(@Body() medicalRecordDto: createMedicalRecordDto, @User('id') id: string) {

    return this.patientService.createMedicalRecord(medicalRecordDto, id);
  }
}
