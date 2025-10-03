import { Appointment } from 'generated/prisma';
import { Hold, Prisma } from 'generated/prisma';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EmailType } from 'src/enums/email.enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class AppointmentService {
  private readonly HOLD_TIME: number = 15 * 60 * 1000;
  private readonly logger: Logger = new Logger(AppointmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  /**
   * Books appointment with doctor and if successful notifies the doctor
   * @param bookAppointmentDto - DTO containg information about the appointment
   * @returns - appointment data
   */
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
            return {
              success: false,
              data: null,
            };
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

          // notify doctor
          await this.notification.notifyDoctorUsingId(
            {
              patientId,
              doctorId,
              dateTime,
            },
            EmailType.BOOK_APPONTMENT,
          );
          return {
            success: true,
            data: appointment,
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      this.logger.error('Error booking appointment', error);
      throw error;
    }
  }

  /**
   * Cancel an appointment, set the time slot back to free and notify the doctor
   * @param userId - ID of the patient initiating the cancellation
   * @param appointmentId - ID of the appointment
   */
  async cancelAppointment(appointmentId: string) {
    try {
      this.logger.log('looking up appointment appointment');
      const appointment = await this.prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: {
          holdExpiresAt: new Date(Date.now()),
          status: 'FREE',
        },
      });

      if (!appointment) {
        throw new HttpException(
          'Failed to book appointment',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // extract required params

      const { doctorId, patientId } = appointment;
      // notify doctor then

      await this.notification.notifyDoctorUsingId(
        {
          doctorId,
          patientId,
        },
        EmailType.CANCEL_APPOINTMENT,
      );

      return { success: true, message: 'Appointment cancelled successfully' };
    } catch (error) {
      this.logger.error('Error cancelling appointment', error);
      throw error;
    }
  }

  async findAllAppointments() {
    return `This action returns all appointment`;
  }

  async findOneAppointment(id: number) {
    return `This action returns a #${id} appointment`;
  }

  async rescheduleAppointment(
    appointmentId: string,
    rescheduleAppointmentDto: RescheduleAppointmentDto,
  ) {
    try {
      // extract participants
      const {
        status,
        dateTime,
        doctorId = '',
        patientId = '',
        initiator,
      } = rescheduleAppointmentDto;

      let update: Record<string, any> = {};

      if (status) {
        update.status = status;
      }
      if (dateTime) {
        update.dateTime = dateTime;
      }
      if (doctorId) {
        update.doctorId = doctorId;
      }
      if (patientId) {
        update.patientId = patientId;
      }

      await this.prisma.appointment.update({
        where: {
          id: appointmentId,
        },
        data: update,
      });

      const response = await this.notification.notifyDoctorUsingId(
        {
          doctorId,
          patientId,
        },
        EmailType.RESCHEDULE_APPOINTMENT,
      );

      if(response.success){
        // create audit logs
      }

    } catch (error) {
      console.error('Failed to reshedule appointment', error);
      throw error;
    }
  }

  async removeAppointment(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
