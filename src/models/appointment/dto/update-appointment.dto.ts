import { PartialType } from '@nestjs/swagger';
import { BookAppointmentDto } from './create-appointment.dto';

export class UpdateAppointmentDto extends PartialType(BookAppointmentDto) {}
