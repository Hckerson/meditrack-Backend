import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { User } from 'src/common/decorators/user.decorator';

@Controller('patient')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}


  @Get('record/all')
  async findAllRecord(@User('id') id: string) {
    if (!id) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }
    return this.patientService.fetchAllMedicalRecords(id);
  }



}
