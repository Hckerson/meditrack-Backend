import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'generated/prisma';
import { AppointmentService } from './appointment.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Roles(Role.PATIENT)
@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('book')
  async create(@Body() bookAppointmentDto: BookAppointmentDto) {
    const response =
      await this.appointmentService.bookAppointment(bookAppointmentDto);
    if (!response.data) {
      throw new HttpException('Time slot not available', HttpStatus.NOT_FOUND);
    }
    return { success: true, message: 'Appointment booked successfully' };
  }

  @Get(':id/cancel')
  async cancel(@Req() req: Request, @Param() id: string) {
    // extract user from request
    const { user } = req.session;
    const userId = user?.id;

    if (!userId) throw new UnauthorizedException('Unauthorized action');

    return await this.appointmentService.cancelAppointment(id);
  }

  @Patch(':id/reschedule')
  async update(
    @Param('id') id: string,
    @Body() rescheduleAppointmentDto: RescheduleAppointmentDto,
  ) {
    if (!rescheduleAppointmentDto.dateTime) {
      throw new BadRequestException('New date is missing');
    }

    return this.appointmentService.rescheduleAppointment(
      id,
      rescheduleAppointmentDto,
    );
  }
}
