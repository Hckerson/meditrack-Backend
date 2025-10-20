import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createMedicalRecordDto } from './dto/create-medicalrecord.dto';
import { BookAppointmentDto } from './dto/create-appointment.dto';
import { NotificationService } from '../notification/notification.service';
import { Appointment } from 'generated/prisma';
import { Hold, Prisma } from 'generated/prisma';
import { EmailType } from 'src/enums/email.enums';

import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Injectable()
export class PatientService {
  private readonly HOLD_TIME: number = 15 * 60 * 1000;
  private readonly logger: Logger = new Logger(PatientService.name);
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

          if (!hold) {
            throw new HttpException(
              'error processing request',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          // finally book the appointment

          await tx.appointment.create({
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
          await this.notification.notifyDoctorForAppointment({
            patientId,
            doctorId,
            dateTime,
          });

          return {
            success: true,
            message: 'Appointment created successfully',
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
  async cancelAppointment(
    appointmentId: string,
    doctorAction: boolean = false,
  ) {
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
          'error processing request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // extract required params

      const { doctorId, patientId } = appointment;

      if (doctorAction) {
        // notify patient
      } else {
        // notify doctor then
        await this.notification.notifyDoctorForCancellation(
          {
            doctorId,
            patientId,
          },
        );
      }

      return { success: true, message: 'Appointment cancelled successfully' };
    } catch (error) {
      this.logger.error('Error cancelling appointment', error);
      throw error;
    }
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

      return { success: true, message: 'Appointment successfully rescheduled' };
    } catch (error) {
      this.logger.error('Failed to reshedule appointment', error);
      throw error;
    }
  }

  async fetchAllMedicalRecords(userId: string) {
    try {
      // find patient with this id

      const patient = await this.prisma.patient.findUnique({
        where: {
          userId,
        },
      });

      if (!patient) {
        throw new HttpException('Invalid user', HttpStatus.BAD_REQUEST);
      }

      const { id } = patient;

      // get patient records
      const records = await this.prisma.patient.findUnique({
        where: {
          id,
        },
        include: {
          Appointment: true,
          MedicalRecord: true,
        },
      });
      return records;
    } catch (error) {
      this.logger.error('Error fetching patient medical records');
      throw error;
    }
  }

  async createMedicalRecord(
    medicalRecordDto: createMedicalRecordDto,
    userId: string,
  ) {
    try {
      // find patient with the id

      const patient = await this.prisma.patient.findUnique({
        where: {
          userId,
        },
      });

      if (!patient) {
        throw new HttpException(
          'Invalid user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const { id } = patient;

      await this.prisma.medicalRecord.create({
        data: { ...medicalRecordDto, patientId: id },
      });

      return { success: true, message: 'Medical record successfully created' };
    } catch (error) {
      this.logger.log('Error creating medical record', error);
      throw error;
    }
  }
}
