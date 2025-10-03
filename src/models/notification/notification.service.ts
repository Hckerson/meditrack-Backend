import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EmailType } from 'src/enums/email.enums';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailSendService } from 'src/lib/services/email/email-send';
import { NotifyDoctorDto } from './dto/doctor-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailSendService,
  ) {}

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }
  /**
   * Helper function for sending notificaion to the doctor
   * @param doctorId - ID of the doctor to be notified
   */
  async notifyDoctorUsingId(
    notifyDoctorDto: NotifyDoctorDto,
    notificationType: EmailType,
  ) {
    const { doctorId, patientId, dateTime } = notifyDoctorDto;
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
        throw new NotFoundException("Couldn't find doctor to notify");
      }

      // extract email
      const { email, firstName } = doctor.User;

      const response = await this.email.initializeEmailSender(
        {
          to: email,
          name: firstName,
          patientId,
          dateTime,
        },
        notificationType,
      );

      if (!response.success) {
        throw new HttpException(
          'Failed to notfiy doctor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return { success: true, message: 'Doctor notified succssfully' };
    } catch (error) {
      console.error('Error notifying doctor');
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
