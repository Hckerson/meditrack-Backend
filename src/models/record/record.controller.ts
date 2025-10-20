import { BadRequestException, Controller } from '@nestjs/common';
import { RecordService } from './record.service';
import { Get, Param } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma';

@Controller('record')
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Roles(Role.NURSE, Role.DOCTOR)
  @Get('patient/:id/all')
  async fetchIndividualRecords(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('missing patient identifier');
    }

    return this.recordService.fetchIndividualRecords(id);
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
    return this.recordService.fetchIndividualRecord(id, recordId);
  }
}
