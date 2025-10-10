import { LoginDto } from './dto/login-dto';
import { Response, Request } from 'express';
import { LinkService } from 'src/lib/links.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup-dto';
import { VerificationType } from 'generated/prisma';
import { SpeakeasyService } from 'src/lib/speakesy.service';
import { ResetPasswordDto } from './dto/reset-password-dto';
import { LocalAuthGuard } from './services/passport/guards/local-auth.guard';
import { GithubAuthGuard } from './services/passport/guards/github-auth.guard';
import { GoogleAuthGuard } from './services/passport/guards/google-auth.guard';
import { GithubStrategy } from './services/passport/strategies/github.strategy';
import { GoogleStrategy } from './services/passport/strategies/google.strategy';
import {
  Logger,
  Param,
  Req,
  UseGuards,
  Controller,
  Get,
  Post,
  Body,
  Res,
  BadRequestException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthError } from './errors/auth-error';

@Controller('auth')
export class AuthController {
  //instance of the global logger service
  private readonly logger: Logger;

  constructor(
    private readonly link: LinkService,
    private readonly authService: AuthService,
    private readonly githubStrategy: GithubStrategy,
    private readonly googleStrategy: GoogleStrategy,
    private readonly speakeasyService: SpeakeasyService,
  ) {
    this.logger = new Logger(AuthController.name);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    return this.authService.login(loginDto, request);
  }

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {

    return this.authService.signUp(signUpDto);
  }

  @Post('password/reset')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: Request,
  ) {
    const { token, type, newPassword } = resetPasswordDto;
    if (!token || !newPassword || !type) {
      throw new AuthError('Missing password or token', HttpStatus.BAD_REQUEST);
    }
    return this.authService.resetPassword(
      token,
      type.toUpperCase() as VerificationType,
      newPassword,
      request,
    );
  }

  @Post('password/reset-link')
  async sendResetPasswordLink(@Body('email') email: string) {
    const verificationData = await this.link.generateVerificationLink(
      email,
      VerificationType.PASSWORD_RESET,
    );

    if(!verificationData.data){
      throw new HttpException('Failed to generate verification link', HttpStatus.INTERNAL_SERVER_ERROR)
    }

    const verificationLink = verificationData.data

    return await this.authService.sendResetPasswordLink(
      email,
      verificationLink,
    );
  }

  @Get('2fa/setup')
  async setup2fa(@Req() request: Request) {
    const user = request.session.user;
    if (!user) {
      throw new AuthError('Unauthorized action', HttpStatus.FORBIDDEN);
    }
    const { id } = user;
    const data = await this.speakeasyService.setupTwoFactor(id as string);
    return { success: true, message: '2fa setup succesfully', data };
  }

  @UseGuards(GithubAuthGuard)
  @Get('login/github')
  async githubLogin(@Req() request: Request) {
    return '';
  }

  @UseGuards(GithubAuthGuard)
  @Get('callback/github')
  async githubCallback(@Req() request: Request, @Res() response: Response) {
    if (!request.user)
      return response.redirect(this.githubStrategy.failureRedirect);
    return response.redirect(this.githubStrategy.successRedirect);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('login/google')
  async GoogleLogin(@Req() request: Request) {
    return '';
  }

  @UseGuards(GoogleAuthGuard)
  @Get('callback/google')
  async GoogleCallback(@Req() request: Request, @Res() response: Response) {
    if (!request.user)
      return response.redirect(this.googleStrategy.failureRedirect);
    return response.redirect(this.googleStrategy.successRedirect);
  }

  @Get('successRedirect/:email')
  async emailRedirect(
    @Res({ passthrough: true }) response: Response,
    @Param('email') email: string,
  ) {
    try {
      return this.authService.success(response, email);
    } catch (error) {
      console.log(`Error redirecting to success route`);
    }
  }

  @Post('2fa/verify')
  async verify2fa(@Req() request: Request, @Body('token') token: string) {
    const user = request.session.user;
    const userId = user?.id;
    const valid = await this.speakeasyService.verifyToken(
      userId as string,
      token,
    );
    return { success: valid };
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() body: { id: string; token: string; type: VerificationType },
  ) {
    const { id, token, type } = body;
    if (!id || !token || !type)
      throw new BadRequestException('Incomplete credentials');
    this.logger.log(`Verifying email for ${id}`);
    const formattedType = type.toUpperCase() as VerificationType;
    return await this.authService.verifyEmail(id, token, formattedType);
  }

  @Get('profile')
  Profile(@Req() request: Request) {
    const user = request.session.user;
    return user;
  }

  @Get('logout')
  logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    return this.authService.logout(request, response);
  }
}
