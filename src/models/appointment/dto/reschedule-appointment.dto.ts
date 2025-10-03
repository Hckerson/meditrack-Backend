import { PartialType } from '@nestjs/swagger';
import { BookAppointmentDto } from './create-appointment.dto';

export class RescheduleAppointmentDto extends PartialType(BookAppointmentDto) {
  initiator: string;
}
