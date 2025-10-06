import { Request } from 'express';
import { Role } from 'generated/prisma';
import { CreateDeptDto } from './dto/create-dept.dto';
import { DepartmentService } from './department.service';
import { Get, Post, Req, Controller, Body } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';

@Roles(Role.ADMIN)
@Controller('department')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  async create(
    @Body()
    createDeptDto: CreateDeptDto,
  ) {
    return this.departmentService.createDepartment(createDeptDto);
  }
}

