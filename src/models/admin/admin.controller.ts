import {
  Controller,
  Get,
} from '@nestjs/common';
import { Role } from 'generated/prisma';
import { AdminService } from './admin.service';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

}
