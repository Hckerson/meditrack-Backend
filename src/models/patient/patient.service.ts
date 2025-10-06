import { PrismaService } from 'src/prisma/prisma.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';


@Injectable()
export class PatientService {
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
      console.error('Error fetching patient medical records');
      throw error;
    }
  }

}

//add remailnig record model props
