import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createMedicalRecordDto } from './dto/create-medicalrecord.dto';

@Injectable()
export class PatientService {
  private readonly logger: Logger = new Logger(PatientService.name);
  constructor(private readonly prisma: PrismaService) {}

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
