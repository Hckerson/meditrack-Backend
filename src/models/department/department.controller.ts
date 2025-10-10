
import { Role } from 'generated/prisma';
import { CreateDeptDto } from './dto/create-dept.dto';
import { DepartmentService } from './department.service';
import { Post, Controller, Body } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(Role.ADMIN)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post('create')
  async create(
    @Body()
    createDeptDto: CreateDeptDto,
  ) {
    return this.departmentService.createDepartment(createDeptDto);
  }
}

