import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDeptDto } from './dto/create-dept.dto';

@Injectable()
export class DepartmentService {
  private readonly logger:Logger = new Logger(DepartmentService.name)
  constructor(private readonly prisma: PrismaService) {}

  async createDepartment(createDeptDto: CreateDeptDto) {
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
