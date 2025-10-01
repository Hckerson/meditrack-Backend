import { Role } from 'generated/prisma';
import { IsEnum, IsString , IsNotEmpty} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum([Role])
  @IsNotEmpty()
  roles: Role[];

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
