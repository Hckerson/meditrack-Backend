import { SignUpDto } from './signup-dto';
import { PartialType } from '@nestjs/mapped-types';
import { VerificationType } from 'generated/prisma';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto extends PartialType(SignUpDto) {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsEnum(VerificationType)
  type: VerificationType;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
