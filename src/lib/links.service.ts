import { randomBytes } from 'crypto';
import { BASE_URL } from './constant';
import { Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User, VerificationType } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class LinkService {
  private logger: Logger;

  constructor(
    private config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.logger = new Logger(LinkService.name);
  }

  async generateVerificationLink(email: string, type: VerificationType) {
    // assign fresh token
    const token = randomBytes(32).toString('hex');

    // generate verification link and store in database
    let user: Pick<User, 'id'> | null;
    try {
      // find user in database
      user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
    } catch (error) {
      this.logger.error(`Error finding user in db`, error);
      throw error;
    }

    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new Error('User not found');
    }

    const userId = user.id;
    this.logger.log(`Generating verification link for user ${user.id}`);

    const verificationUrl = await this.constructVerificationUrl(
      userId,
      type,
      token,
    );

    const verificationCode = await this.storeVerificationToken(
      userId,
      type,
      token,
    );

    if (!verificationCode) {
      return {
        success: false,
        message: 'Failed to generate verification link',
        data: null
      };
    }
    return {
      success: true,
      message: 'verification link generated successfully',
      data: verificationUrl,
    };
  }

  async storeVerificationToken(
    userId: string,
    type: VerificationType,
    token: string,
  ) {
    this.logger.log(`Storing verification link`);
    try {
      const verificationCode = await this.prisma.verificationCodes.create({
        data: {
          code: token,
          type: type,
          userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
        },
      });
      if (!verificationCode) {
        return;
      }
      return verificationCode;
    } catch (error) {
      this.logger.error(`Error storing verificaton token`, error);
      throw error;
    }
  }

  async constructVerificationUrl(
    userId: string,
    type: VerificationType,
    token: string,
  ) {
    const route = `${process.env.BASE_URL}/auth/verify`;
    const params = new URLSearchParams({
      token: token,
      userId: userId,
      type: type.toLowerCase(),
    });
    return `${route}?${params.toString()}`;
  }
}
