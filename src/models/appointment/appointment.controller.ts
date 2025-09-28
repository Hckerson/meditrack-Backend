import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('book')
  create(@Body() bookAppointmentDto: BookAppointmentDto) {
    return this.appointmentService.bookAppointment(bookAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAllAppointments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOneAppointment(+id);
  }

  @Patch(':id/reschedule')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(+id, updateAppointmentDto);
  }

  @Delete(':id/cancel')
  remove(@Param('id') id: string) {
    return this.appointmentService.removeAppointment(+id);
  }
}
