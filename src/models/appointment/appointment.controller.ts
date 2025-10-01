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
  async create(@Body() bookAppointmentDto: BookAppointmentDto) {
    try {
      return await this.appointmentService.bookAppointment(bookAppointmentDto);
    } catch (error) {
      return { success: false, message: 'Failed to book appointment' };
    }
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
