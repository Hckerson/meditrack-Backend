import { IsString, IsNotEmpty } from 'class-validator';

export class NotifyDoctorDto {
  @IsString()
  @IsNotEmpty()
  dateTime: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  doctorId: string;
}
