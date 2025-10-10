import { Route, Form } from 'generated/prisma';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class IssuePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsEnum(Form)
  @IsNotEmpty()
  form: Form;

  @IsEnum(Route)
  @IsNotEmpty()
  route: Route[];

  @IsString()
  @IsNotEmpty()
  note: string;

  @IsString()
  @IsNotEmpty()
  amount: string;
}
