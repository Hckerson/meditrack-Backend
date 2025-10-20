import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import appConfig from './config/app/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './models/auth/auth.module';
import dbConfig from './config/database/configuration';
import emailConfig from './config/email/configuration';
import { RolesGuard } from './common/guards/roles.guard';
import { AdminModule } from './models/admin/admin.module';
import sessionConfig from './config/session/configuration';
import { DoctorModule } from './models/doctor/doctor.module';
import { PatientModule } from './models/patient/patient.module';
import { NotificationModule } from './models/notification/notification.module';
import { DepartmentModule } from './models/department/department.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, emailConfig, sessionConfig],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    AdminModule,
    PrismaModule,
    DoctorModule,
    PatientModule,
    NotificationModule,
    DepartmentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
