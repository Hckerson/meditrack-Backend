import { Role } from 'generated/prisma';
import { IsEnum, IsString } from 'class-validator';

export class SignUpDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum([Role])
  roles: Role[];

  @IsString()
  fullName: string;
}
