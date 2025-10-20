import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RecordService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * lookup individual records from the db and return result on successful lookup
   * @param patientId - id of the patient being looked up
   */

  async fetchIndividualRecords(patientId: string) {
    try {
      const search = await this.prisma.patient.findUnique({
        where: {
          id: patientId,
        },
        select: {
          MedicalRecord: {
            select: {
              Record: true,
            },
          },
        },
      });

      if (!search?.MedicalRecord) {
        return { success: true, message: 'No records found', data: null };
      }

      const { Record } = search?.MedicalRecord;

      return Record
    } catch (error) {
      console.error('Error fetching patient record', error);
      throw error;
    }
  }


  /**
   * lookup specific record for a patient and return result on successful lookup
   * @param id - Patient identifier
   * @param recordId - Record identifier
   */
  async fetchIndividualRecord(id: string, recordId: string){
    try {
      
    } catch (error) {
      console.error('Error fetching  record', error)
      throw error
    }
  }
}
