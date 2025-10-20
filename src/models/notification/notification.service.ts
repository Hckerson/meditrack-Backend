import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EmailType } from 'src/enums/email.enums';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailSendService } from 'src/lib/services/email/email-send';
import { NotifyDoctorDto } from './dto/doctor-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger: Logger = new Logger(NotificationService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailSendService,
  ) {}

  /**
   * Notify doctor when new appointment are made
   * @param doctorId - ID of the doctor to be notified
   */
  async notifyDoctorForAppointment(notifyDoctorDto: NotifyDoctorDto) {
    const { doctorId, patientId, dateTime } = notifyDoctorDto;
    try {
      const doctorDetails = await this.fetchDoctorDetails(doctorId);
      const { email, firstName } = doctorDetails;

      const response = await this.email.initializeEmailSender(
        {
          to: email,
          name: firstName,
          patientId,
          dateTime,
        },
        EmailType.BOOK_APPONTMENT,
      );

      if (!response.success) {
        throw new HttpException(
          'Failed to notfiy doctor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { success: true, message: 'Doctor notified succssfully' };
    } catch (error) {
      this.logger.error('Error notifying doctor');
      throw error;
    }
  }

  /**
   * Notify doctor when appointments are cancelled
   * @param notifyDoctorDto - Request object contining doctor and patient identifier
   */
  async notifyDoctorForCancellation(notifyDoctorDto: NotifyDoctorDto) {
    const { doctorId, patientId, dateTime } = notifyDoctorDto;
    try {
      const doctorDetails = await this.fetchDoctorDetails(doctorId);
      const { email, firstName } = doctorDetails;

      const response = await this.email.initializeEmailSender(
        {
          to: email,
          name: firstName,
          patientId,
          dateTime,
        },
        EmailType.CANCEL_APPOINTMENT,
      );

      if (!response.success) {
        throw new HttpException(
          'Failed to notfiy doctor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { success: true, message: 'Doctor notified succssfully' };
    } catch (error) {
      this.logger.error('Error notifying doctor');
      throw error;
    }
  }

  async fetchDoctorDetails(doctorId: string) {
    try {
      // first find the doctor and retrieve his/ her email
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          id: doctorId,
        },
        select: {
          User: true,
        },
      });

      if (!doctor) {
        throw new NotFoundException('Error notify doctor');
      }
      return doctor.User;
    } catch (error) {
      this.logger.error('Error notifying doctor');
      throw error;
    }
  }
}
