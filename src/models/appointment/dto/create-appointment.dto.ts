import { Billing, Status } from 'generated/prisma';

export class BookAppointmentDto {
  status: Status;
  dateTime: Date;
  doctorId: string;
  patientId: string;
}
