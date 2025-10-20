import { Controller, Get, Param, Delete, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotifyDoctorDto } from './dto/doctor-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
}
