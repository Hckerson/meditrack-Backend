import { IsString, IsNotEmpty } from 'class-validator';

export class FilterDoctorDto {

  @IsString()
  departmentName?: string;

  @IsString()
  specialization?: string;
}
