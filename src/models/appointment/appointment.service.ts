import { Doctor, Hold, Prisma } from 'generated/prisma';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Appointment } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { EmailSendService } from 'src/lib/services/email/email-send';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { EmailType } from 'src/enums/email.enums';

@Injectable()
export class AppointmentService {
  private readonly HOLD_TIME: number = 15 * 60 * 1000;
  private readonly logger: Logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    private readonly email: EmailSendService,
  ) {}
  async bookAppointment(bookAppointmentDto: BookAppointmentDto) {
    // extract args
    const { dateTime, doctorId, patientId } = bookAppointmentDto;

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const now = new Date();
          const expiresAt = new Date(now.getTime() + this.HOLD_TIME);
          // check doctor availabiility for the chosen date
          const availableSlot = await tx.appointment.findFirst({
            where: {
              doctorId,
              dateTime: {
                equals: dateTime,
              },
              OR: [
                { status: 'FREE' },
                { status: 'PENDING', holdExpiresAt: { lt: now } },
              ],
            },
          });

          if (!availableSlot) {
            return { success: false, message: 'Time slot no longer available' };
          }

          // create soft lock
          let hold: Hold;

          hold = await tx.hold.create({
            data: {
              doctorId,
              patientId,
              expiresAt,
            },
          });

          // finally book the appointment
          let appointment: Appointment;

          appointment = await tx.appointment.create({
            data: {
              patientId,
              doctorId,
              dateTime,
              status: 'PENDING',
              holdId: hold.id,
              holdExpiresAt: expiresAt,
            },
          });

          return appointment;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      console.error('Error booking appointment', error);
      throw error;
    }
  }

  async findAllAppointments() {
    return `This action returns all appointment`;
  }

  async findOneAppointment(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async updateAppointment(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return `This action updates a #${id} appointment`;
  }

  async removeAppointment(id: number) {
    return `This action removes a #${id} appointment`;
  }

 
}
