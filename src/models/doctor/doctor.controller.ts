import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { DoctorService } from './doctor.service';
import { UnauthorizedException } from '@nestjs/common';
import { FilterDoctorDto } from './dto/filter-doctor.dto';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PatientService } from '../patient/patient.service';
import { IssuePrescriptionDto } from './dto/issue-prescription.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('doctor')
export class DoctorController {
  private readonly logger: Logger = new Logger(DoctorController.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly doctorService: DoctorService,
    private readonly patientService: PatientService,
  ) {}

  @Roles(Role.ADMIN)
  @Get()
  async findAll() {
    return this.doctorService.findAll();
  }

  @Post()
  async findAllByFilter(@Body() filterDocorDto: FilterDoctorDto) {
    return this.doctorService.findAllByFilter(filterDocorDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Roles(Role.DOCTOR)
  @Get(':appointmentId/cancel')
  async cancel(
    @Req() req: Request,
    @Param() id: string,
    @User('id') userId: string,
  ) {
    // extract user from request

    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.patientService.cancelAppointment(id, true);
  }

  @Roles(Role.DOCTOR)
  @Post(':appointmentId/prescription/issue')
  async issuePrescription(
    @Param('appointmentId') appointmentId: string,
    @Body() prescriptionDto: IssuePrescriptionDto,
  ) {
    try {
      if (!appointmentId) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }

      const appointment = await this.prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

      if (!appointment) {
        throw new HttpException(
          'Error processing request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return this.doctorService.issuePrescription(
        prescriptionDto,
        appointmentId,
      );
    } catch (error) {
      this.logger.error('Error saving prescription');
      throw error;
    }
  }

  @Post(':appointmentId/record/create')
  async createRecord(
    @Param('appointmentId') appointmentId: string,
    @Body() recordDto: CreateRecordDto,
  ) {
    return this.doctorService.createRecord(recordDto, appointmentId);
  }

  @Roles(Role.DOCTOR)
  @Get(':appointmentId/end')
  async end(
    @Param('appointmentId') id: string,
    @User('id') userId: string,
  ) {
    // extract user from request
    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.doctorService.endAppointment(id);
  }
}
