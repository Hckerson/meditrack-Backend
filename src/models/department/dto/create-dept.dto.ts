import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDeptDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  specialization: string;
  
}
