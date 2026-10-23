import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class UpdateProcessDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsDateString()
  @IsNotEmpty()
  inspectionDate: string;
}
