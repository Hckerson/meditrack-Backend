import * as bcrypt from 'bcryptjs';
import { createHash } from 'node:crypto';
import { LoginDto } from './dto/login-dto';
import { Request, Response } from 'express';
import { SignUpDto } from './dto/signup-dto';
import { EmailType } from 'src/enums/email.enums';
import { LinkService } from 'src/lib/links.service';
import { User, VerificationCodes, VerificationType } from 'generated/prisma';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { EmailSend, MailOpts } from 'src/lib/services/email/email-send';
import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthError } from './errors/auth-error';
import { error } from 'node:console';

@Injectable()
export class AuthService {
  /**
   * Service responsible for all authentication logic
   *        -login, logout
   *        -signup, session creation and deletion,
   *        -reset password
   *        -encryption and decryption of session
   */

  // secret used to encrypt and decrypt session
  private readonly secret: string;
  // encodec version of the secret
  private readonly encodedKey: Uint8Array;
  // logger
  private readonly logger: Logger;
  // link service for generating verification link

  /**
   * @param email -Service for sending emails and verification link
   * @param prisma -Service for interacting with database
   * @param risk -Risk assessment service for evaluating login threat level
   * @throws {Error} if cookie secret is not found
   */
  constructor(
    private email: EmailSend,
    private prisma: PrismaService,
    private link: LinkService,
  ) {
    this.secret = process.env.COOKIE_SECRET || '';
    if (!this.secret) {
      throw new Error('Cookie secret not found');
    }
    this.encodedKey = new TextEncoder().encode(this.secret);
    this.logger = new Logger(AuthService.name, { timestamp: true });
  }

  /**
   *
   * @param signUpDto Data transfer object containing email and password
   * @param ipAddress -User ip address for ip geolocation
   * @param request -Express request object to extract header
   * @returns
   */
  async signUp(signUpDto: SignUpDto) {
    const { email, password, roles } = signUpDto;
    if (!email || !password || !roles) {
      this.logger.error(`Email or password not provided`);
      throw new AuthError(
        'email or password not provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    //check if user Exists
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
      });

      // return response immediately if user exist
      if (user) {
        this.logger.log(`User already exists`);
        throw new AuthError('user already exists', HttpStatus.CONFLICT);
      }

      this.logger.log(`User does not exist, creating new user`);

      // create user in database

      this.logger.log(`Creating new user in database`);
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Creating user with data', signUpDto);
      const newUser = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          provider: 'local',
          username: email.split('@')[0],
          roles,
        },
      });

      if (!newUser) {
        throw new AuthError(
          'Error creating new User',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // send the user a welcome email
      this.triggerEmailSending(
        {
          to: email,
        },
        EmailType.WELCOME,
      );

      const verificationLink = await this.link.generateVerificationLink(
        signUpDto.email,
        VerificationType.VERIFY_EMAIL,
      );
      if (!verificationLink)
        //delete user
        throw new AuthError(
          'could not generate verification link',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );

      // send the user a verification email
      this.triggerEmailSending(
        {
          to: email,
          verificationLink,
        },
        EmailType.VERIFY_EMAIL,
      );

      return { success: true, message: 'signup successful' };
    } catch (error) {
      this.logger.log(`Error checking user existence: ${error}`);

      if (error instanceof AuthError) {
        throw error;
      }
    }
  }

  /**
   * Authenticates a user, creates session and stores secret
   * @param response -Express response(to set token)
   * @param loginDto -Data object transfer containing password, email etc
   * @returns -Resoves an object with a message and an HTTP status code
   */
  async login(loginDto: LoginDto, request: Request) {
    if (!loginDto.password || !loginDto.email)
      throw new AuthError('Incomplete credentials', HttpStatus.BAD_REQUEST);

    // destructuring loginDTO
    const { email = '', password, rememberMe } = loginDto;

    // call the validateUser function
    const result = await this.validateUser(email, password);

    // check if result contains the data payload
    if (!result?.data?.isValid) {
      throw new AuthError('invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const { id, roles } = result?.data as {
      id: string;
      roles: string[];
    };
    // process login if user validation was successfull

    const fingerprint = await this.generateFingerprint(request);

    const sessionTTL = rememberMe
      ? 7 * 24 * 60 * 60 * 1000
      : 1 * 60 * 60 * 1000;

    request.session.user = {
      id,
      roles,
      fingerprint,
    };

    console.log(request.session.user);
    request.session.cookie.maxAge = sessionTTL;

    // send login-alert email
    await this.triggerEmailSending(
      {
        to: email,
      },
      EmailType.LOGIN_ALERT,
    );
    return { success: true, message: 'login successful' };
  }

  /**
   * helper function to componse the user device fingerprint
   * @param request -request object used to extract headers
   * @returns
   */
  async generateFingerprint(request: Request) {
    try {
      const userAgent = request.headers['user-agent'] || '';
      const acceptLanguage = request.headers['accept-language'] || '';
      const ip = request.ip || request.socket.remoteAddress || '';

      const fingerprint = createHash('sha256')
        .update(`${userAgent}-${acceptLanguage}-${ip}`)
        .digest('hex');

      return fingerprint;
    } catch (error) {
      this.logger.log(`Error generating fingerprint: ${error}`);
      throw new AuthError(
        'Error generating device fingerprint',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * validate user credentials without creating a session
   * @param email - User emais',l address
   * @param password -User password
   * @returns true if valid else false, return an object if not user is found
   */
  async validateUser(email: string, password: string) {
    // check for user in the database
    this.logger.log(`Finding user in database`);
    let userInfo: Pick<User, 'password' | 'id' | 'roles'> | null;
    try {
      userInfo = await this.prisma.user.findUnique({
        where: {
          email: email.toLowerCase(),
        },
        select: {
          password: true,
          id: true,
          roles: true,
        },
      });
    } catch (error) {
      throw new AuthError(
        'Error looking up user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!userInfo) {
      throw new AuthError('Invalid user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const { password: hashedPassword, id, roles } = userInfo;
    // check if user is valid
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid)
      return { success: false, message: 'Invalid credentials', data: null };

    return {
      success: true,
      message: 'User validated successfully',
      data: { isValid, id, roles },
    };
  }

  /**
   *
   * @param userId -Id of the authenticated user
   * @param [token] -Optional remember token
   * @returns -id of the just created session
   */

  /**
   * Sign and encrypt a new jwt payload
   * @param payload -The jwt payload (contains user id and expiration date, etc)
   * @returns -The signed and encrypted jwt
   */
  async encrypt(payload: JWTPayload) {
    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(this.encodedKey);
    return accessToken;
  }

  /**
   * Decrypt and verify a jwt
   * @param accessToken -User session token
   * @returns -Returns the decrypted payload
   */
  async decrypt(accessToken: string | undefined = '') {
    // decrypt payload
    const payload = await jwtVerify(accessToken, this.encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  }

  /**
   * Clear user session to logout user
   * @param response -Express request object to clear cookie
   * @returns -Returns a success message
   */
  async logout(request: Request, response: Response) {
    return new Promise((resolve, reject) => {
      request.session.destroy((err) => {
        if (err) {
          console.error(`Error logging user out`, err);
          reject(new InternalServerErrorException('Failed to logout'));
          return;
        }
        response.clearCookie('connect.sid');
        resolve({ message: 'Logout successful' });
      });
    });
  }

  /**
   *Verify user email using token
   * @param email -Email address of the user
   * @param token -Verification token stored earlier on during sign up
   * @returns -Object containg message and status
   */
  async verifyEmail(userId: string, token: string, type: VerificationType) {
    const CURRENT_TIME = new Date(Date.now());
    // find verification code in the database
    let verificatiionCode: Pick<VerificationCodes, 'code' | 'expiresAt'> | null;
    try {
      verificatiionCode = await this.prisma.verificationCodes.findUnique({
        where: {
          user: {
            id: userId,
          },
          code: token,
          type,
        },
        select: {
          code: true,
          expiresAt: true,
        },
      });
    } catch (error) {
      this.logger.error('Error looking up verification code', error);
      throw new AuthError(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // check if verificatiion code actually exists
    if (!verificatiionCode)
      throw new AuthError('Error veifying token', HttpStatus.BAD_REQUEST);

    // check if token has not yet expired
    if (verificatiionCode.expiresAt < CURRENT_TIME) {
      throw new AuthError('Token expired', HttpStatus.BAD_REQUEST);
    }

    // check validity of token
    const isValid = verificatiionCode.code === token;
    if (!isValid) {
      throw new AuthError('Invalid token', HttpStatus.BAD_REQUEST);
    }

    // verify user email and update code status
    try {
      await this.prisma.verificationCodes.update({
        where: {
          user: {
            id: userId,
          },
          code: token,
          type,
        },
        data: {
          verifiedAt: new Date(Date.now()),
          codeUsed: true,
          user: {
            update: {
              emailVerified: true,
            },
          },
        },
      });
      return { success: true, message: 'Email verified' };
    } catch (error) {
      this.logger.log('Error updating user verification status');
      throw new AuthError(
        'Internal server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Send verification link to reset password
   * @param email -Email of the user
   * @param verificationLink -Link to be sent
   * @returns Object containing message and status
   */
  async sendResetPasswordLink(email: string, resetLink: string) {
    // send retset password link
    if (!email || !resetLink) {
      throw new AuthError(
        `Email or password is missing`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const response = await this.email.initializeEmailSender(
      {
        to: email,
        resetLink,
      },
      EmailType.RESET_PASSWORD,
    );

    if (!response.success) {
      throw new AuthError(
        "Couldn't process request right now",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { success: true, message: 'Password reset link sent successfully' };
  }

  async success(response: Response, email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
      select: { id: true },
    });
    if (!user) {
      return { message: 'User not found', status: 400 };
    }
    return { message: 'login successful', status: 200 };
  }

  /**
   * Reset user password after validating token
   * @param resetPasswordDto -Data transfer object containing email, password and token
   * @returns -Object containing message and status
   */
  async resetPassword(
    token: string,
    type: VerificationType,
    password: string,
    request: Request,
  ) {
    // veify token
    let verificatiionCode: Pick<
      VerificationCodes,
      'codeUsed' | 'expiresAt'
    > | null;
    try {
      verificatiionCode = await this.prisma.verificationCodes.findUnique({
        where: {
          code: token,
          type,
        },
        select: {
          expiresAt: true,
          codeUsed: true,
        },
      });
    } catch (error) {
      console.error(`Error fetching user: ${error}`);
      throw new AuthError(
        'Error processing request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!verificatiionCode) {
      throw new AuthError('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    if (verificatiionCode?.expiresAt < new Date(Date.now())) {
      throw new AuthError('Token Expired', HttpStatus.UNAUTHORIZED);
    }

    // get userId from session
    const session = request.session.user;
    const userId = session?.id;
    // reset password
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw new AuthError(
        'Error processng request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return { success: true, message: 'Password reset successful' };
  }

  // helper function to  trigger email sending
  /**
   *
   * @param options - params that will be sent ot the user inbox
   * @param type - type of email to be sent
   */
  async triggerEmailSending(
    options: MailOpts,
    type: 'welcome' | 'reset-password' | 'login-alert' | 'verify-email',
  ) {
    try {
      const response = await this.email.initializeEmailSender(options, type);
      if (!response.success) {
        this.logger.error(`Error sending welcome email: ${response.message}`);
      }
      this.logger.log(
        `${type == 'verify-email' ? 'email verification' : type} email sent to ${options.to?.split('@')[0]}`,
      );
    } catch (error) {
      console.error(`Error triggering email: ${error}`);
    }
  }
}
