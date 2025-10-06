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
        throw new HttpException(
          'Invalid user provided',
          HttpStatus.BAD_REQUEST,
        );
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

  async createMedicalRecord(medicalRecordDto: createMedicalRecordDto) {
    try {
    } catch (error) {}
  }
}

//add remailnig record model props
