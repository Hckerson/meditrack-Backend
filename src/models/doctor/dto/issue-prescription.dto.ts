import { Route } from 'generated/prisma';
import { IsString, IsNotEmpty } from 'class-validator';

export class IssuePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  form: string;

  @IsString()
  @IsNotEmpty()
  route: Route[];

  @IsString()
  @IsNotEmpty()
  note: string;

}
