import * as speakeasy from 'speakeasy';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QrcodeService } from '../lib/qr-code';
import { PrismaService } from 'src/providers/prisma/prisma.service';

@Injectable()
export class SpeakeasyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly qrcodeService: QrcodeService,
  ) {}

  /**
   * Creates and stores a new TOTP secret for the given user,
   * returns the otpauth URL for QR code generation.
   */
  async setupTwoFactor(userId: string) {
    const secret = speakeasy.generateSecret();
    // Store the base32 secret in the user record
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { speakeasySecret: secret.base32 },
      });
    } catch (error) {
      console.error('Error setting up two factor for user ', userId);
      throw error;
    }
    // Return the URL for the authenticator app
    const qrCode = await this.getQrCodeForUser(userId);
    return { otpauthUrl: secret.otpauth_url!, qrCode };
  }

  /**
   * Generates a QR code image (data URL) for the otpauth URL.
   */
  async getQrCodeForUser(userId: string): Promise<string | undefined> {
    // Retrieve the stored secret
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { speakeasySecret: true, email: true },
    });
    if (!user?.speakeasySecret) {
      throw new NotFoundException('2FA not set up for this user');
    }
    const otpauthUrl = speakeasy.otpauthURL({
      secret: user.speakeasySecret,
      label: `Authify (${user?.email})`,
      encoding: 'base32',
    });
    return this.qrcodeService.generateQrCode(otpauthUrl);
  }

  /**
   * Verifies a TOTP token provided by the user.
   */
  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { speakeasySecret: true },
    });
    if (!user?.speakeasySecret) {
      throw new UnauthorizedException('2FA not set up for this user');
    }
    return speakeasy.totp.verify({
      secret: user.speakeasySecret,
      encoding: 'base32',
      token,
      window: 1, // allow one-step clock drift
    });
  }
}
