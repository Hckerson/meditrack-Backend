import {
  BadRequestException,
  HttpStatus,
  HttpException,
  Controller,
} from '@nestjs/common';
import { RecordService } from './record.service';
import { Get, Param, Post } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma';
import { User } from 'src/common/decorators/user.decorator';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Roles(Role.NURSE, Role.DOCTOR)
  @Get('patient/:id/all')
  async fetchIndividualRecords(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('missing patient identifier');
    }

    return this.recordService.fetchPatientRecords(id);
  }

  @Roles(Role.NURSE, Role.DOCTOR)
  @Get('patient/:id/:recordId')
  async fetchIndividualRecord(
    @Param('id') id: string,
    @Param('recordId') recordId: string,
  ) {
    if (!id || recordId) {
      throw new BadRequestException('missing record identifier');
    }
    return this.recordService.fetchPatientRecord(id, recordId);
  }

  @Get('all')
  async findAllRecord(@User('id') id: string) {
    if (!id) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }
    return this.recordService.fetchAllRecords(id);
  }

  @Get(':recordId')
  async fiindSpecificRecord(
    @User('id') id: string,
    @Param('recordId') recordId: string,
  ) {
    if (!id) {
      throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
    }


    if(!recordId){
      throw new BadRequestException('Missing record identifier')
    }

    return this.recordService.fetchRecordById(id, recordId);
  }

  @Post('')
  async updatePatientRecord() {}
}
