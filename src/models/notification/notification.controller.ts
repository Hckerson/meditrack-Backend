import { Controller, Get, Param, Delete, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotifyDoctorDto } from './dto/doctor-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Body() notifyDoctorDto: NotifyDoctorDto) {
    return this.notificationService.notifyDoctorUsingId(notifyDoctorDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
