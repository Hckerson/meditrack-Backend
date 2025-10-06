import {
  Controller,
  Get,
  Post,
  Req,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { DoctorService } from './doctor.service';
import { UnauthorizedException } from '@nestjs/common';
import { FilterDoctorDto } from './dto/filter-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AppointmentService } from '../appointment/appointment.service';

@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
  ) {}
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
  @Get('appointment/:id/cancel')
  async cancel(@Req() req: Request, @Param() id: string) {
    // extract user from request
    const { user } = req.session;
    const userId = user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.appointmentService.cancelAppointment(id, true);
  }


  @Post('prescription/issue')
  async issuePrescription() {
    return this.doctorService.issuePrescription();
  }

}
