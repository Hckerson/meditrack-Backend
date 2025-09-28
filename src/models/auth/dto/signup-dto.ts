import { IsEnum, IsString } from 'class-validator';
import { UserRoles } from '../enums/user-role.enum';

export class SignUpDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsEnum([UserRoles])
  roles: UserRoles[];

  @IsString()
  fullName: string;
}
