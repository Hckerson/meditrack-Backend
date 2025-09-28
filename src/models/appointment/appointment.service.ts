import { Injectable } from '@nestjs/common';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  bookAppointment(bookAppointmentDto: BookAppointmentDto) {
    return 'This action adds a new appointment';
  }

  findAllAppointments() {
    return `This action returns all appointment`;
  }

  findOneAppointment(id: number) {
    return `This action returns a #${id} appointment`;
  }

  updateAppointment(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  removeAppointment(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
