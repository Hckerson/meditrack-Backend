import { Injectable, Logger } from '@nestjs/common';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FilterDoctorDto } from './dto/filter-doctor.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger: Logger = new Logger(DoctorService.name);

  async findAll() {
    return `This action returns all doctor`;
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
      console.error('Error finding doctor', error);
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

  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    return `This action updates a #${id} doctor`;
  }

  async remove(id: number) {
    return `This action removes a #${id} doctor`;
  }
}
