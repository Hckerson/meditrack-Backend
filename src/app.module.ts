import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import appConfig from './config/app/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './models/auth/auth.module';
import dbConfig from './config/database/configuration';
import emailConfig from './config/email/configuration';
import { RolesGuard } from './common/guards/roles.guard';
import { NurseModule } from './models/nurse/nurse.module';
import { AdminModule } from './models/admin/admin.module';
import sessionConfig from './config/session/configuration';
import { DoctorModule } from './models/doctor/doctor.module';
import { PatientModule } from './models/patient/patient.module';
import { AppointmentModule } from './models/appointment/appointment.module';

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
    DoctorModule,
    NurseModule,
    PatientModule,
    AdminModule,
    AppointmentModule,
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
