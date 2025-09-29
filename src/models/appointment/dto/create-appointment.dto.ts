import { Billing, Status } from 'generated/prisma';

export class BookAppointmentDto {
  status: Status;
  dateTime: string;
  doctorId: string;
  patientId: string;
}
