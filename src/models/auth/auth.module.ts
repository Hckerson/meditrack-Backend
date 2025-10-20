import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { QrcodeService } from 'src/lib/qr-code';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { LinkService } from 'src/services/links.service';
import { AuthModuleOptions } from '@nestjs/passport';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { SpeakeasyService } from 'src/services/speakesy.service';
import { EmailSendService } from 'src/providers/email/email-send';
import { LocalStrategy } from './services/passport/strategies/local.strategy';
import { GithubStrategy } from './services/passport/strategies/github.strategy';
import { GoogleStrategy } from './services/passport/strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    LinkService,
    AuthService,
    PrismaService,
    LocalStrategy,
    QrcodeService,
    GoogleStrategy,
    GithubStrategy,
    EmailSendService,
    SpeakeasyService,
    AuthModuleOptions,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
