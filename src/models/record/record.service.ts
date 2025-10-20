import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class RecordService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * lookup individual records from the db and return result on successful lookup
   * @param patientId - id of the patient being looked up
   */

  async fetchPatientRecords(patientId: string) {
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

      // return an empty array on successful search with zero records
      if (!search?.MedicalRecord) {
        return { success: false, message: 'No records found', data: [] };
      }

      const recordsArray = search.MedicalRecord.Record;
      const count = recordsArray.length;

      return {
        success: true,
        message: `${count} record${count === 1 ? '' : 's'} found`,
        data: recordsArray,
      };
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
  async fetchPatientRecord(id: string, recordId: string) {
    try {
      const records = await this.fetchPatientRecords(id);

      if (records.success && records.data?.length > 0) {
        // filter records to find specific record
        try {
          const exactRecord = records.data.find(
            (record) => record.id == recordId,
          );

          if (!exactRecord) {
            return { success: false, message: 'Record not found', data: null };
          }
          return { success: true, message: 'Record found', data: exactRecord };
        } catch (error) {
          console.error('Error filtering records');
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching  record', error);
      throw error;
    }
  }

  async fetchAllRecords(userId: string) {
    try {
      await this.fetchPatientRecords(userId);
    } catch (error) {
      console.error('Error fetching individual record');
    }
  }

  async fetchRecordById(userId: string, recordId: string) {
    try {
      await this.fetchPatientRecord(userId, recordId);
    } catch (error) {
      console.error(`Error finding record ${recordId}`, error);
    }
  }
}
