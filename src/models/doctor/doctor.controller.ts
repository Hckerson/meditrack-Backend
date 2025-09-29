import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Role } from 'generated/prisma';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { FilterDoctorDto } from './dto/filter-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}
  @Get()
  async findAll() {
    return this.doctorService.findAll();
  }

  @Post()
  async findAllByFilter(@Body() filterDocorDto: FilterDoctorDto){
    return this.doctorService.findAllByFilter(filterDocorDto)
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Roles(Role.DOCTOR, Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Roles( Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.doctorService.remove(+id);
  }
}
