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
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Request } from 'express';

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

  @Get()
  async findAll() {
    return this.appointmentService.findAllAppointments();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentService.findOneAppointment(+id);
  }

  @Patch(':id/reschedule')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(+id, updateAppointmentDto);
  }

  @Delete(':id/cancel')
  async remove(@Param('id') id: string) {
    return this.appointmentService.removeAppointment(+id);
  }
}
