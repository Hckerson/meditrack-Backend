import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { QrcodeService } from 'src/lib/qr-code';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { LinkService } from 'src/lib/links.service';
import { AuthModuleOptions } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpeakeasyService } from 'src/lib/speakesy.service';
import { EmailSend } from 'src/lib/services/email/email-send';
import { LocalStrategy } from '../../authentication/passport/strategies/local.strategy';
import { GithubStrategy } from '../../authentication/passport/strategies/github.strategy';
import { GoogleStrategy } from '../../authentication/passport/strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    LinkService,
    EmailSend,
    AuthService,
    PrismaService,
    LocalStrategy,
    QrcodeService,
    GoogleStrategy,
    GithubStrategy,
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
