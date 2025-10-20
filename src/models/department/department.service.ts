import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { CreateDeptDto } from './dto/create-dept.dto';

@Injectable()
export class DepartmentService {
  private readonly logger: Logger = new Logger(DepartmentService.name);
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create departments and store in database
   * @returns - success or failure message
   */
  async createDepartment(createDeptDto: CreateDeptDto) {
    this.logger.log('Creating department');
    try {
      await this.prisma.department.create({
        data: createDeptDto,
      });
      return { success: true, message: 'Department created successfully' };
    } catch (error) {
      this.logger.error('Error creating department');
      throw error;
    }
  }
}
