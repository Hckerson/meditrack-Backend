import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { PatientService } from './patient.service';
import { User } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { createMedicalRecordDto } from './dto/create-medicalrecord.dto';


@Roles(Role.PATIENT)
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

  @Post('medicalrecord/create')
  async createMedicalRecord(
    @Body() medicalRecordDto: createMedicalRecordDto,
    @User('id') id: string,
  ) {
    return this.patientService.createMedicalRecord(medicalRecordDto, id);
  }

  @Post('book/appointment')
  async create(@Body() bookAppointmentDto: BookAppointmentDto) {
    const response =
      await this.patientService.bookAppointment(bookAppointmentDto);
    if (!response.data) {
      throw new HttpException('Time slot not available', HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Appointment booked successfully' };
  }

  @Get(':id/cancel/appointment')
  async cancel(@Req() req: Request, @Param() id: string) {
    // extract user from request
    const { user } = req.session;
    const userId = user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.patientService.cancelAppointment(id);
  }

  @Patch(':id/reschedule/appointment')
  async update(
    @Param('id') id: string,
    @Body() rescheduleAppointmentDto: RescheduleAppointmentDto,
  ) {
    if (!rescheduleAppointmentDto.dateTime) {
      throw new BadRequestException('New date is missing');
    }

    return this.patientService.rescheduleAppointment(
      id,
      rescheduleAppointmentDto,
    );
  }
}
