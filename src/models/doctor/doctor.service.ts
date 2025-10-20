import { FilterDoctorDto } from './dto/filter-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IssuePrescriptionDto } from './dto/issue-prescription.dto';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateRecordDto } from './dto/create-record.dto';

@Injectable()
export class DoctorService {
  private readonly logger: Logger = new Logger(DoctorService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all available doctor
   * @returns a list of doctors if any is found and an empty array if none is foundd
   */
  async findAll() {
    try {
      const alldoctors = await this.prisma.doctor.findMany();
      if (!alldoctors) return [];
      return alldoctors;
    } catch (error) {
      console.error('Error fetching all doctors');
      throw error;
    }
  }

  /**
   * Records prescription issued to patients
   * @param prescriptionDto - Payload containing prescription details
   * @param appointmentId - ID of the appointment
   * @returns 
   */
  async issuePrescription(
    prescriptionDto: IssuePrescriptionDto,
    appointmentId: string,
  ) {
    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        select: {
          Record: true,
        },
      });

      if (!appointment || !appointment.Record) {
        throw new HttpException(
          'Error processing request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { Record } = appointment;

      const { id: recordId } = Record;

      // issue prescription

      await this.prisma.medication.create({
        data: {
          ...prescriptionDto,
          recordId,
        },
      });

      // notify patient

      

      return { success: true, message: 'Prescription issued successfully' };
    } catch (error) {
      this.logger.error('Error issuing prescription');
      throw error;
    }
  }

  /**
   * Create record of everything during and after the appointment
   */
  async createRecord(recordDto: CreateRecordDto, appointmentId: string) {
    try {
      // find patient with the appointmend id to extract medicalRecord data

      const patient = await this.prisma.patient.findFirst({
        where: {
          Appointment: {
            some: {
              id: appointmentId,
            },
          },
        },
        select: {
          MedicalRecord: true,
        },
      });

      if (!patient?.MedicalRecord) {
        throw new HttpException(
          'Error processing request, check if user has completed registration',
          HttpStatus.BAD_REQUEST,
        );
      }

      const { id } = patient.MedicalRecord;

      const doctor = await this.prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
      });

      if (!doctor) {
        throw new HttpException(
          'error processing request',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { id: doctorId } = doctor;

      await this.prisma.record.create({
        data: { ...recordDto, appointmentId, medicalRecordId: id, doctorId },
      });

      return { success: true, message: 'Record created successfully' };
    } catch (error) {
      console.error('Error creating record');
    }
  }

  /**
   * Find a specified doctor and return all data partaining to him or her
   * @param id - ID  of the doctor being searched for
   * @returns - Object containing doctors info
   */
  async findOne(id: string) {
    try {
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          id,
        },
        include: {
          Appointment: true,
          Department: true,
        },
      });

      if (!doctor) {
        return {
          success: false,
          message: "specified doctor doesn't exist",
          data: null,
        };
      }
    } catch (error) {
      this.logger.error('Error finding doctor', error);
      throw error;
    }
  }

  /**
   * find available doctors using the passed filters
   * @param filterDocorDto -Object containing filter params
   * @returns - a list of found doctors
   */
  async findAllByFilter(filterDocorDto: FilterDoctorDto) {
    const { departmentName, specialization } = filterDocorDto;

    let searchData: Record<string, any> = {};
    // construct search object

    let department: Record<string, any> = {};
    if (departmentName) {
      department.name = departmentName;
    }

    if (specialization) {
      searchData.specialization = specialization;
    }

    if (Object.keys(department).length > 0) {
      searchData.Department = department;
    }

    try {
      const doctors = await this.prisma.doctor.findMany({
        where: searchData,
      });
      if (doctors) {
        return doctors;
      }
      return [];
    } catch (error) {
      this.logger.error('Error fetching filtered doctor search');
      throw error;
    }
  }
}
