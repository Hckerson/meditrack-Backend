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
  constructor(private readonly patientService: PatientService) {}

  @Post('medicalrecord/create')
  async createMedicalRecord(
    @Body() medicalRecordDto: createMedicalRecordDto,
    @User('id') id: string,
  ) {
    return this.patientService.createMedicalRecord(medicalRecordDto, id);
  }

  @Post('appointment/book')
  async create(@Body() bookAppointmentDto: BookAppointmentDto) {
    const response =
      await this.patientService.bookAppointment(bookAppointmentDto);
    if (!response.data) {
      throw new HttpException('Time slot not available', HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Appointment booked successfully' };
  }

  @Get('appointment/:id/cancel')
  async cancel(@Req() req: Request, @Param() id: string) {
    // extract user from request
    const { user } = req.session;
    const userId = user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.patientService.cancelAppointment(id);
  }

  @Patch('appointment/:id/reschedule/')
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
